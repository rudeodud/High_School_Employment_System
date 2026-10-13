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
