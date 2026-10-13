"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
  onSubmit?: (credentials: { id: string; password: string }) => void;
  errorMessage?: string;
  onErrorClear?: () => void;
};

// 입력 화면만 구현합니다. 입력값을 서버나 브라우저 저장소에 저장하지 않습니다.
export default function AuthForm({ mode, onSubmit, errorMessage, onErrorClear }: AuthFormProps) {
  const isSignup = mode === "signup";
  const title = isSignup ? "회원가입" : "로그인";
  const [feedback, setFeedback] = useState("");

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
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">학교 채용 시스템</p>
        <h1 id="auth-title">{title}</h1>
        <p className="auth-intro">
          {isSignup ? "학생 계정으로 사용할 정보를 입력해 주세요." : "아이디와 비밀번호를 입력해 주세요."}
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
            placeholder="8자 이상 입력"
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

          <button type="submit" className="primary-button">입력 확인 (미리보기)</button>
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
