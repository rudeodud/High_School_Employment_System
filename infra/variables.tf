variable "aws_region" {
  description = "모든 리소스를 만들 AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "리소스 이름에 붙일 짧은 소문자 이름"
  type        = string
  default     = "school-jobs-demo"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,19}$", var.project_name))
    error_message = "project_name은 영문 소문자로 시작하는 3~20자의 영문 소문자, 숫자, 하이픈이어야 합니다."
  }
}

variable "admin_ssh_cidr" {
  description = "Bastion SSH를 허용할 내 공인 IP 한 개 (예: 203.0.113.10/32)"
  type        = string

  validation {
    condition     = can(cidrhost(var.admin_ssh_cidr, 0)) && endswith(var.admin_ssh_cidr, "/32")
    error_message = "admin_ssh_cidr은 공인 IPv4 주소 한 개를 /32 형식으로 입력해야 합니다."
  }
}

variable "ssh_public_key_path" {
  description = "두 EC2에 등록할 SSH 공개키 파일의 로컬 경로"
  type        = string
}

variable "db_password" {
  description = "RDS MySQL 관리자 비밀번호. TF_VAR_db_password 환경변수로 전달하세요."
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_password) >= 8
    error_message = "db_password는 8자 이상이어야 합니다."
  }
}

variable "web_instance_type" {
  description = "Next.js를 실행할 웹 EC2 크기"
  type        = string
  default     = "t3.micro"
}

variable "bastion_instance_type" {
  description = "SSH 중계용 Bastion EC2 크기"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_class" {
  description = "RDS MySQL 인스턴스 크기"
  type        = string
  default     = "db.t3.micro"
}
