"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 모든 페이지에서 공통으로 사용하는 상단 메뉴입니다.
export default function Header() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  return (
    <header className="site-header">
      <div className="shell header-content">
        <Link href="/" className="brand">학교 채용 시스템</Link>
        <nav className="account-nav" aria-label="계정 메뉴">
          <Link
            href="/login"
            className={isLoginPage ? "account-link active" : "account-link"}
            aria-current={isLoginPage ? "page" : undefined}
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className={isSignupPage ? "account-link active" : "account-link"}
            aria-current={isSignupPage ? "page" : undefined}
          >
            회원가입
          </Link>
        </nav>
      </div>
    </header>
  );
}
