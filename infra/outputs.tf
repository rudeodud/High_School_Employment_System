output "web_public_ip" {
  description = "브라우저에서 접속할 웹 EC2의 공인 IP"
  value       = aws_instance.web.public_ip
}

output "web_private_ip" {
  description = "Bastion에서 SSH 접속할 웹 EC2의 사설 IP"
  value       = aws_instance.web.private_ip
}

output "bastion_public_ip" {
  description = "관리자 SSH 접속용 Bastion 공인 IP"
  value       = aws_instance.bastion.public_ip
}

output "db_endpoint" {
  description = "웹 EC2에서 사용할 RDS MySQL 주소"
  value       = aws_db_instance.mysql.address
}

output "db_port" {
  description = "RDS MySQL 접속 포트"
  value       = aws_db_instance.mysql.port
}

output "peering_connection_id" {
  description = "서버 VPC와 DB VPC의 Peering 연결 ID"
  value       = aws_vpc_peering_connection.server_db.id
}

output "github_actions_role_arn" {
  description = "GitHub Actions의 AWS_ROLE_ARN 저장소 변수에 넣을 IAM Role ARN"
  value       = aws_iam_role.github_actions.arn
}

output "ecr_repository_name" {
  description = "GitHub Actions의 ECR_REPOSITORY 저장소 변수에 넣을 이름"
  value       = aws_ecr_repository.app.name
}

output "web_instance_id" {
  description = "GitHub Actions의 EC2_INSTANCE_ID 저장소 변수에 넣을 EC2 ID"
  value       = aws_instance.web.id
}
