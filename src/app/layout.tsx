import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "학교 채용 시스템", description: "학교와 외부 채용 공고를 한곳에서 확인하세요." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return <html lang="ko"><body>{children}</body></html>;
}
