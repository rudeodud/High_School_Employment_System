# 수행평가 AWS 인프라

주신 그림대로 서버 VPC에 **웹 EC2와 Bastion EC2**, DB VPC에 **비공개 RDS MySQL**을 만듭니다. 두 VPC는 Peering으로 연결합니다. RDS용 서브넷은 두 가용 영역에 하나씩 만들지만, DB 인스턴스는 한 개(Single-AZ)입니다.

```text
인터넷 → 웹 EC2 (공개 서브넷 A) ─┐
관리자 → Bastion EC2 (공개 서브넷 B) ─┤ 서버 VPC 10.0.0.0/16
                                    └─ VPC Peering ─ DB VPC 10.1.0.0/16
                                                       └─ RDS MySQL (비공개)
```

웹 EC2의 80/443은 공개하고, SSH 22는 Bastion에서만 접근할 수 있습니다. Bastion의 SSH는 `admin_ssh_cidr` 한 IP에서만 허용합니다. RDS 3306은 웹 EC2의 보안 그룹에서만 허용합니다.

## 준비

1. AWS CLI 인증을 설정합니다. AWS 키를 Terraform 파일에 적지 않습니다.
2. 로컬 SSH 공개키를 준비합니다. 예: `~/.ssh/id_ed25519.pub`.
3. `terraform.tfvars.example`을 `terraform.tfvars`로 복사하고 실제 공인 IP와 공개키 경로를 적습니다. 예시 IP로는 SSH 접속할 수 없습니다.
4. DB 비밀번호는 `TF_VAR_db_password` 환경변수로 전달합니다. 비밀번호가 Terraform 상태 파일에 기록될 수 있으므로 상태 파일을 공개하지 않습니다.

## 검증과 생성

`infra/`에서 실행합니다.

```bash
terraform fmt -check
terraform init
terraform validate
terraform plan
terraform apply
```

`terraform apply`는 실제 과금되는 AWS 리소스를 생성합니다. Terraform은 인프라만 만들며, Next.js 설치·배포와 HTTPS 인증서 설정은 별도 작업입니다. 인프라 생성 직후 웹 EC2에 앱이 표시되지는 않습니다. 사용을 마치면 `terraform destroy`로 리소스를 정리하세요. 이 예시의 RDS는 삭제 시 최종 스냅샷을 만들지 않으므로 DB 데이터도 사라집니다.

## 배포 후 접속

`terraform output`으로 Bastion·웹 EC2 IP와 RDS 주소를 확인합니다. Amazon Linux 2023의 기본 사용자는 `ec2-user`입니다. 개인키는 Bastion에 복사하지 않고 로컬 SSH 설정에서 `ProxyJump`를 사용합니다.

```sshconfig
Host school-bastion
  HostName BASTION_PUBLIC_IP
  User ec2-user
  IdentityFile ~/.ssh/id_ed25519

Host school-web
  HostName WEB_PRIVATE_IP
  User ec2-user
  IdentityFile ~/.ssh/id_ed25519
  ProxyJump school-bastion
```

위 내용을 로컬 `~/.ssh/config`에 추가하고 IP·키 경로를 바꾼 뒤 `ssh school-web`을 실행합니다.
