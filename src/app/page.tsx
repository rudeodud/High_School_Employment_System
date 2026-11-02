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
      <section className="intro hero">
        <div className="hero-copy">
          <p className="eyebrow"><span aria-hidden="true" /> 우리 학교 커리어 플랫폼</p>
          <h1>가능성을 발견하고,<br /><em>내일의 일을 만나다.</em></h1>
          <p className="hero-description">
            학교에 도착한 채용 소식부터 외부 취업 정보까지,<br />학생에게 필요한 기회를 한곳에서 확인하세요.
          </p>
          <div className="hero-pills" aria-label="서비스 특징">
            <span>✓ 학교 맞춤 공고</span>
            <span>✓ 간편한 정보 탐색</span>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-top">
            <div>
              <span className="panel-kicker">OPPORTUNITY BOARD</span>
              <strong>새로운 기회가<br />도착했어요</strong>
            </div>
            <span className="panel-badge">LIVE</span>
          </div>
          <div className="hero-stats">
            <div><strong>{sampleJobs.filter((job) => job.source === "school").length}</strong><span>학교 공고</span></div>
            <div><strong>{sampleJobs.filter((job) => job.source === "external").length}</strong><span>외부 공고</span></div>
            <div><strong>1</strong><span>학교정보 API</span></div>
          </div>
          <p className="panel-note">관심 있는 공고를 지금 확인해 보세요.</p>
        </div>
      </section>

      <aside className="notice">
        <span className="notice-icon" aria-hidden="true">i</span>
        <span><strong>데모 안내</strong> 현재 기업과 공고는 가상의 샘플입니다. 로그인·신청·외부 API는 준비 중입니다.</span>
      </aside>

      <div className="toolbar">
        <h2>
          {activeSource === "school" ? "학교에 도착한 공고" : "외부 채용 공고"}
          <small>{filteredJobs.length}건</small>
        </h2>
        <label className="search-field">
          <span className="sr-only">기업명, 직무, 지역 검색</span>
          <span aria-hidden="true">⌕</span>
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
