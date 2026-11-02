"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
  onSubmit?: (credentials: { id: string; password: string; role: AccountRole }) => void;
  errorMessage?: string;
  onErrorClear?: () => void;
};

export type AccountRole = "student" | "teacher";

const accountRoles: {
  value: AccountRole;
  label: string;
  signupDescription: string;
  loginDescription: string;
}[] = [
  {
    value: "student",
    label: "학생 계정",
    signupDescription: "채용 공고를 확인하고 지원 정보를 관리합니다.",
    loginDescription: "학교에서 등록한 학생 계정으로 로그인합니다.",
  },
  {
    value: "teacher",
    label: "교사 계정",
    signupDescription: "학교 공고와 학생 취업 정보를 관리합니다.",
    loginDescription: "승인된 교사 계정으로 로그인합니다.",
  },
];

// 입력 화면만 구현합니다. 입력값을 서버나 브라우저 저장소에 저장하지 않습니다.
export default function AuthForm({ mode, onSubmit, errorMessage, onErrorClear }: AuthFormProps) {
  const isSignup = mode === "signup";
  const title = isSignup ? "회원가입" : "로그인";
  const [feedback, setFeedback] = useState("");
  const [accountRole, setAccountRole] = useState<AccountRole>("student");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);

    // required, minLength 등의 기본 검사는 브라우저가 먼저 처리합니다.
    if (isSignup && values.get("password") !== values.get("passwordConfirm")) {
      setFeedback("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }

    if (!isSignup && onSubmit) {
      // 로그인 페이지의 데모 검사 함수에 폼의 값을 전달합니다.
      onSubmit({
        id: String(values.get("username") ?? ""),
        password: String(values.get("password") ?? ""),
        role: accountRole,
      });
      return;
    }

    setFeedback(
      "입력 형식 확인이 끝났습니다. DB 연결 전이므로 실제 " +
      (isSignup ? "계정은 생성되지 않습니다." : "로그인은 처리되지 않습니다."),
    );
    form.reset();
  }

  return (
    <main className="shell auth-main">
      <section className="auth-showcase" aria-hidden="true">
        <p className="panel-kicker">SCHOOL CAREER PLATFORM</p>
        <h2>학생의 가능성이<br />진로로 이어지는 곳</h2>
        <p>학교와 기업의 기회를 더 가깝게 연결합니다.</p>
        <div className="auth-feature-list">
          <span>01 <strong>학교 맞춤 채용정보</strong></span>
          <span>02 <strong>전국 학교정보 검색</strong></span>
          <span>03 <strong>안전한 학생 계정</strong></span>
        </div>
      </section>
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">학교 채용 시스템</p>
        <h1 id="auth-title">{title}</h1>
        <p className="auth-intro">
          {isSignup ? "사용할 계정 유형을 선택하고 정보를 입력해 주세요." : "아이디와 비밀번호를 입력해 주세요."}
        </p>
        <p className="notice" id="auth-notice">
          화면 미리보기입니다. 실제 {title}은 아직 제공하지 않으며, 입력한 정보는 저장하지 않습니다.
          {!isSignup && " 데모 확인용 아이디와 비밀번호는 모두 1111입니다."}
        </p>

        <form
          onSubmit={handleSubmit}
          onChange={() => {
            setFeedback("");
            onErrorClear?.();
          }}
          aria-describedby="auth-notice"
        >
          <fieldset className="role-selector">
            <legend>계정 유형</legend>
            <div className="role-options">
              {accountRoles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={accountRole === role.value ? "role-option active" : "role-option"}
                  aria-pressed={accountRole === role.value}
                  onClick={() => {
                    setAccountRole(role.value);
                    setFeedback("");
                    onErrorClear?.();
                  }}
                >
                  <strong>{role.label}</strong>
                  <span>{isSignup ? role.signupDescription : role.loginDescription}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <input type="hidden" name="role" value={accountRole} />

          {!isSignup && (
            <p className="role-guidance">
              {accountRole === "student"
                ? "학교에서 등록한 학생 계정 정보를 입력하세요."
                : "교사 계정은 학교 관리자 승인 후 사용할 수 있습니다."}
            </p>
          )}

          {isSignup && (
            <>

              <label htmlFor="name">이름</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                maxLength={50}
                placeholder="홍길동"
              />

              {accountRole === "student" ? (
                <>
                  <label htmlFor="studentNumber">학번</label>
                  <input
                    id="studentNumber"
                    name="studentNumber"
                    inputMode="numeric"
                    pattern="[0-9]{1,20}"
                    title="학번을 숫자로 입력해 주세요."
                    required
                    maxLength={20}
                    placeholder="예: 30101"
                  />
                </>
              ) : (
                <>
                  <label htmlFor="schoolName">학교명</label>
                  <input
                    id="schoolName"
                    name="schoolName"
                    required
                    maxLength={100}
                    placeholder="재직 중인 학교명을 입력하세요"
                  />
                  <label htmlFor="teacherNumber">교직원번호</label>
                  <input
                    id="teacherNumber"
                    name="teacherNumber"
                    required
                    maxLength={30}
                    placeholder="학교에서 사용하는 교직원번호"
                  />
                </>
              )}
            </>
          )}

          <label htmlFor="username">{isSignup ? "아이디" : "아이디 또는 이메일"}</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            required
            minLength={isSignup ? 4 : 1}
            maxLength={isSignup ? 30 : 254}
            pattern={isSignup ? "[A-Za-z0-9_]+" : undefined}
            title={isSignup ? "영문, 숫자, 밑줄로 4~30자를 입력해 주세요." : undefined}
            placeholder={isSignup ? "영문, 숫자, 밑줄 4~30자" : "아이디 또는 이메일"}
          />
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={isSignup ? 8 : 4}
            maxLength={128}
            placeholder={isSignup ? "8자 이상 입력" : "비밀번호 입력"}
          />

          {isSignup && (
            <>
              <label htmlFor="passwordConfirm">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                placeholder="비밀번호를 한 번 더 입력"
              />
            </>
          )}

          {!isSignup && (
            <div className="login-options">
              <label className="remember-id">
                <input type="checkbox" name="rememberId" />
                아이디 저장
              </label>
              <button
                type="button"
                className="text-button"
                onClick={() => setFeedback("비밀번호 찾기 기능은 준비 중입니다.")}
              >
                비밀번호 찾기
              </button>
            </div>
          )}

          <button type="submit" className="primary-button">
            {isSignup
              ? `${accountRole === "student" ? "학생" : "교사"} 계정 만들기`
              : `${accountRole === "student" ? "학생" : "교사"} 로그인`}
            <span aria-hidden="true">→</span>
          </button>
          <p className="form-feedback" role="status" aria-live="polite">
            {errorMessage || feedback}
          </p>
        </form>

        <p className="auth-switch">
          {isSignup ? "이미 계정이 있나요? " : "아직 계정이 없나요? "}
          <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "로그인" : "회원가입"}</Link>
        </p>
        <Link className="back-link" href="/">← 공고 목록으로 돌아가기</Link>
      </section>
    </main>
  );
}
