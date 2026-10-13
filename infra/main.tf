terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "Terraform"
    }
  }
}

locals {
  server_vpc_cidr = "10.0.0.0/16"
  db_vpc_cidr     = "10.1.0.0/16"
}

# 두 가용 영역은 RDS DB 서브넷 그룹에 필요합니다.
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# ── 서버 VPC: 웹 EC2와 Bastion EC2 ─────────────────────────────
resource "aws_vpc" "server" {
  cidr_block           = local.server_vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "${var.project_name}-server-vpc" }
}

resource "aws_internet_gateway" "server" {
  vpc_id = aws_vpc.server.id
  tags   = { Name = "${var.project_name}-igw" }
}

resource "aws_subnet" "web" {
  vpc_id                  = aws_vpc.server.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = { Name = "${var.project_name}-web-public" }
}

resource "aws_subnet" "bastion" {
  vpc_id                  = aws_vpc.server.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = { Name = "${var.project_name}-bastion-public" }
}

resource "aws_route_table" "server_public" {
  vpc_id = aws_vpc.server.id
  tags   = { Name = "${var.project_name}-server-public-routes" }
}

resource "aws_route" "server_internet" {
  route_table_id         = aws_route_table.server_public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.server.id
}

resource "aws_route_table_association" "web" {
  subnet_id      = aws_subnet.web.id
  route_table_id = aws_route_table.server_public.id
}

resource "aws_route_table_association" "bastion" {
  subnet_id      = aws_subnet.bastion.id
  route_table_id = aws_route_table.server_public.id
}

# ── DB VPC: 인터넷에 공개하지 않는 RDS ─────────────────────────
resource "aws_vpc" "db" {
  cidr_block           = local.db_vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "${var.project_name}-db-vpc" }
}

resource "aws_subnet" "db_a" {
  vpc_id            = aws_vpc.db.id
  cidr_block        = "10.1.1.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = { Name = "${var.project_name}-db-private-a" }
}

resource "aws_subnet" "db_b" {
  vpc_id            = aws_vpc.db.id
  cidr_block        = "10.1.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = { Name = "${var.project_name}-db-private-b" }
}

resource "aws_route_table" "db_private" {
  vpc_id = aws_vpc.db.id
  tags   = { Name = "${var.project_name}-db-private-routes" }
}

resource "aws_route_table_association" "db_a" {
  subnet_id      = aws_subnet.db_a.id
  route_table_id = aws_route_table.db_private.id
}

resource "aws_route_table_association" "db_b" {
  subnet_id      = aws_subnet.db_b.id
  route_table_id = aws_route_table.db_private.id
}

# Peering만 생성해서는 통신할 수 없으므로 양쪽 라우팅을 추가합니다.
resource "aws_vpc_peering_connection" "server_db" {
  vpc_id      = aws_vpc.server.id
  peer_vpc_id = aws_vpc.db.id
  auto_accept = true

  tags = { Name = "${var.project_name}-server-db-peering" }
}

resource "aws_route" "server_to_db" {
  route_table_id            = aws_route_table.server_public.id
  destination_cidr_block    = local.db_vpc_cidr
  vpc_peering_connection_id = aws_vpc_peering_connection.server_db.id
}

resource "aws_route" "db_to_server" {
  route_table_id            = aws_route_table.db_private.id
  destination_cidr_block    = local.server_vpc_cidr
  vpc_peering_connection_id = aws_vpc_peering_connection.server_db.id
}

# ── 보안 그룹 ────────────────────────────────────────────────────
resource "aws_security_group" "bastion" {
  name        = "${var.project_name}-bastion-sg"
  description = "SSH to bastion from one administrator IP"
  vpc_id      = aws_vpc.server.id

  ingress {
    description = "SSH from administrator"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-bastion-sg" }
}

resource "aws_security_group" "web" {
  name        = "${var.project_name}-web-sg"
  description = "Public web access; SSH only from bastion"
  vpc_id      = aws_vpc.server.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "SSH from bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-web-sg" }
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "MySQL only from the web EC2 security group"
  vpc_id      = aws_vpc.db.id

  # 같은 리전의 피어 VPC 보안 그룹을 참조할 수 있습니다.
  ingress {
    description     = "MySQL from web EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  tags = { Name = "${var.project_name}-db-sg" }

  depends_on = [aws_vpc_peering_connection.server_db]
}

# ── EC2 두 대와 RDS 한 개 ────────────────────────────────────────
resource "aws_key_pair" "project" {
  key_name   = "${var.project_name}-key"
  public_key = file(pathexpand(var.ssh_public_key_path))
}

resource "aws_instance" "web" {
  ami                         = data.aws_ssm_parameter.al2023_ami.value
  instance_type               = var.web_instance_type
  subnet_id                   = aws_subnet.web.id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.web.id]
  key_name                    = aws_key_pair.project.key_name

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = { Name = "${var.project_name}-web" }
}

resource "aws_instance" "bastion" {
  ami                         = data.aws_ssm_parameter.al2023_ami.value
  instance_type               = var.bastion_instance_type
  subnet_id                   = aws_subnet.bastion.id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  key_name                    = aws_key_pair.project.key_name

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
    encrypted   = true
  }

  tags = { Name = "${var.project_name}-bastion" }
}

resource "aws_db_subnet_group" "db" {
  name       = "${var.project_name}-db-subnets"
  subnet_ids = [aws_subnet.db_a.id, aws_subnet.db_b.id]

  tags = { Name = "${var.project_name}-db-subnets" }
}

resource "aws_db_instance" "mysql" {
  identifier              = "${var.project_name}-mysql"
  engine                  = "mysql"
  instance_class          = var.db_instance_class
  allocated_storage       = 20
  storage_type            = "gp2"
  storage_encrypted       = true
  db_name                 = "schooljobs"
  username                = "school_admin"
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.db.name
  vpc_security_group_ids  = [aws_security_group.db.id]
  availability_zone       = data.aws_availability_zones.available.names[0]
  publicly_accessible     = false
  multi_az                = false
  backup_retention_period = 1

  # 수행평가용 환경: destroy 시 최종 스냅샷을 만들지 않습니다.
  skip_final_snapshot = true

  tags = { Name = "${var.project_name}-mysql" }
}
