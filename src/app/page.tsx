"use client";

import { useState } from "react";
import JobCard from "@/components/JobCard";
import { useJobSource } from "@/components/JobSourceProvider";
import { sampleJobs } from "@/data/jobs";

export default function Home() {
  // 공고 분류는 상단 메뉴와 공유하고, 검색어·펼침 상태는 이 화면에 보관합니다.
  const { activeSource } = useJobSource();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredJobs = sampleJobs.filter((job) => {
    const matchesSource = job.source === activeSource;
    const searchableText = `${job.company} ${job.title} ${job.location}`.toLowerCase();
    return matchesSource && searchableText.includes(normalizedQuery);
  });

  function toggleJob(jobId: number) {
    setExpandedJobId((currentId) => currentId === jobId ? null : jobId);
  }

  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">우리 학교 취업 게시판</p>
        <h1>첫 시작을 위한 기회,<br />한곳에서 찾아보세요.</h1>
        <p>학교 채용 공고와 외부 취업 정보를 함께 확인하세요.</p>
      </section>

      <aside className="notice">
        현재 표시된 기업과 공고는 모두 가상의 샘플입니다. 로그인·신청·외부 API는 준비 중입니다.
      </aside>

      <div className="toolbar">
        <h2>
          {activeSource === "school" ? "학교에 도착한 공고" : "외부 채용 공고"}
          <small>{filteredJobs.length}건</small>
        </h2>
        <label>
          <span className="sr-only">기업명, 직무, 지역 검색</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="기업명, 직무, 지역 검색"
            type="search"
          />
        </label>
      </div>

      <div className="cards">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isExpanded={expandedJobId === job.id}
            onToggle={() => toggleJob(job.id)}
          />
        ))}
      </div>
      {filteredJobs.length === 0 && (
        <p className="empty">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>
      )}
    </main>
  );
}
