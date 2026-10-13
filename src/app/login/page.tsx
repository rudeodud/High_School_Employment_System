"use client";

import AuthForm from "@/components/AuthForm";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (credentials: { id: string; password: string }) => {
    setError("");

    // 서버 인증 전까지 사용하는 데모 입력 검사입니다. 실제 로그인 상태는 만들지 않습니다.
    if (credentials.id === "1111" && credentials.password === "1111") {
      alert("데모 입력을 확인했습니다. 실제 로그인 상태는 저장되지 않습니다.");
      router.push("/");
    } else {
      setError("ID 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <AuthForm
      mode="login"
      onSubmit={handleLogin}
      errorMessage={error}
      onErrorClear={() => setError("")}
    />
  );
}
