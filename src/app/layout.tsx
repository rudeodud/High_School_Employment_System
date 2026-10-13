import type { Metadata } from "next";
import Header from "@/components/Header";
import { JobSourceProvider } from "@/components/JobSourceProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "학교 채용 시스템",
  description: "학교와 외부 채용 공고를 한곳에서 확인하세요.",
};

// 개별 page.tsx는 children 위치에 표시됩니다.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <JobSourceProvider>
          <Header />
          {children}
        </JobSourceProvider>
        <footer className="shell site-footer">
          학교 채용 시스템 · 로컬 개발 버전
        </footer>
      </body>
    </html>
  );
}
