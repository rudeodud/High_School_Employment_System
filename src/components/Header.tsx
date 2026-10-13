"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useJobSource } from "@/components/JobSourceProvider";
import type { JobSource } from "@/data/jobs";

const jobLinks: { source: JobSource; label: string }[] = [
  { source: "school", label: "학교 채용 공고" },
  { source: "external", label: "외부 채용 공고" },
];

// 모든 페이지에서 공통으로 사용하는 상단 메뉴입니다.
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeSource, setActiveSource } = useJobSource();
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  function openJobSource(source: JobSource) {
    setActiveSource(source);
    if (pathname !== "/") router.push("/");
  }

  return (
    <header className="site-header">
      <div className="shell header-content">
        <Link href="/" className="brand">학교 채용 시스템</Link>
        <nav className="job-nav" aria-label="채용 공고">
          {jobLinks.map(({ source, label }) => (
            <button
              key={source}
              type="button"
              className={pathname === "/" && activeSource === source ? "active" : ""}
              aria-pressed={pathname === "/" && activeSource === source}
              onClick={() => openJobSource(source)}
            >
              {label}
            </button>
          ))}
        </nav>
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
