# 학교 채용 시스템

학생이 학교·외부 채용 공고를 확인하는 수행평가 프로젝트입니다.

--아직 미완성--

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 현재 기능

- 상단 메뉴에서 학교·외부 공고 전환, 검색, 상세 펼치기
- 현재 페이지에 맞춰 강조되는 로그인·회원가입 메뉴와 입력 화면
- 회원가입 필수값·비밀번호 확인 검사
- 모바일 화면 대응
- 나이스 Open API를 이용한 학교 기본정보 검색

**현재 인증 화면은 미리보기입니다.** 계정 생성·로그인·정보 저장은 하지 않습니다.
로그인 화면에서 아이디와 비밀번호 `1111`을 입력하면 데모 입력 검사를 통과하고 홈으로 이동합니다.
공고는 가상 샘플이며, DB 연결·인증 서버·신청·외부 API는 아직 구현하지 않았습니다.
AWS Terraform 설계와 실행 방법은 [`infra/README.md`](infra/README.md)에 있습니다.

## 나이스 학교정보 API

프로젝트 루트의 `.env.local`에 발급받은 인증키를 저장합니다.

```env
NEIS_API_KEY=발급받은_인증키
```

개발 서버를 다시 실행한 뒤 `http://localhost:3000/schools`에서 학교명을 검색합니다.
인증키는 `src/app/api/schools/route.ts` 서버 라우트에서만 사용하며 브라우저에는 전달하지 않습니다.

## EC2 CI/CD

`main` 브랜치에 push하면 GitHub Actions가 다음 순서로 배포합니다.

1. ESLint와 Next.js production build를 실행합니다.
2. Docker 이미지를 만들어 Amazon ECR에 올립니다.
3. GitHub OIDC로 임시 AWS 권한을 받습니다. 장기 AWS 액세스 키는 사용하지 않습니다.
4. AWS Systems Manager Run Command가 EC2에서 새 이미지를 내려받아 실행합니다.
5. 컨테이너 상태 검사에 실패하면 이전 이미지로 되돌립니다.

최초 설정과 GitHub 저장소 변수 등록 방법은 [`infra/README.md`](infra/README.md#cicd-최초-설정)를 따르세요.

## 코드를 읽는 순서

1. `src/app/layout.tsx`: 모든 화면에 공통 메뉴와 푸터를 배치합니다.
2. `src/components/Header.tsx`: 공고 분류와 로그인·회원가입 메뉴입니다.
3. `src/components/JobSourceProvider.tsx`: 상단 메뉴와 공고 목록이 공유하는 선택 상태입니다.
4. `src/app/page.tsx`: 선택한 분류와 검색어로 공고를 걸러 표시합니다.
5. `src/data/jobs.ts`: 공고의 데이터 형식과 가상 데이터를 정의합니다.
6. `src/components/JobCard.tsx`: 공고 한 개를 보여 줍니다.
7. `src/app/login/page.tsx`, `src/app/signup/page.tsx`: 주소별 페이지입니다.
8. `src/components/AuthForm.tsx`: 로그인·회원가입 입력 화면과 입력 검사를 담당합니다.
9. `src/app/globals.css`: 공통·공고·계정 화면 스타일입니다.

## 기본 개념

- `useState`: 탭, 검색어 등 화면에서 바뀌는 값을 기억합니다.
- `props`: 부모 화면이 자식 컴포넌트에 전달하는 값입니다.
- `filter`: 조건에 맞는 공고를 고릅니다.
- `map`: 공고마다 카드를 하나씩 만듭니다.
- `onSubmit`: 폼 제출 시 실행됩니다. 현재는 입력 확인만 합니다.

## 검사

```bash
npm run lint
npm run build
```
