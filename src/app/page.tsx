"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import JobCard from "@/components/JobCard";
import { useJobSource } from "@/components/JobSourceProvider";
import { sampleJobs, type Job } from "@/data/jobs";

type JobsResponse = {
  jobs?: Job[];
  totalCount?: number;
  message?: string;
};

export default function Home() {
  // 공고 분류는 상단 메뉴와 공유하고, 검색어·펼침 상태는 이 화면에 보관합니다.
  const { activeSource } = useJobSource();
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [externalJobs, setExternalJobs] = useState<Job[]>([]);
  const [externalTotalCount, setExternalTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (activeSource !== "external") return;

    const controller = new AbortController();

    async function loadExternalJobs() {
      setIsLoading(true);
      setLoadError("");

      try {
        const params = new URLSearchParams();
        if (submittedQuery) params.set("keyword", submittedQuery);
        const response = await fetch(`/api/jobs?${params}`, { signal: controller.signal });
        const data = (await response.json()) as JobsResponse;

        if (!response.ok) throw new Error(data.message || "채용정보 조회에 실패했습니다.");

        setExternalJobs(data.jobs ?? []);
        setExternalTotalCount(data.totalCount ?? data.jobs?.length ?? 0);
      } catch (error) {
        if (controller.signal.aborted) return;
        setExternalJobs([]);
        setExternalTotalCount(0);
        setLoadError(error instanceof Error ? error.message : "채용정보 조회에 실패했습니다.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadExternalJobs();
    return () => controller.abort();
  }, [activeSource, submittedQuery, requestVersion]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSchoolJobs = sampleJobs.filter((job) => {
    const matchesSource = job.source === "school";
    const searchableText = `${job.company} ${job.title} ${job.location}`.toLowerCase();
    return matchesSource && searchableText.includes(normalizedQuery);
  });
  const visibleJobs = activeSource === "school" ? filteredSchoolJobs : externalJobs;
  const visibleCount = activeSource === "school" ? visibleJobs.length : externalTotalCount;

  function toggleJob(jobId: string) {
    setExpandedJobId((currentId) => currentId === jobId ? null : jobId);
  }

  function searchJobs(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeSource === "external") {
      setExpandedJobId(null);
      setSubmittedQuery(searchQuery.trim());
      setRequestVersion((version) => version + 1);
    }
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
            <div><strong>{externalTotalCount || "-"}</strong><span>고용24 공고</span></div>
            <div><strong>2</strong><span>연결 API</span></div>
          </div>
          <p className="panel-note">관심 있는 공고를 지금 확인해 보세요.</p>
        </div>
      </section>

      <aside className="notice">
        <span className="notice-icon" aria-hidden="true">i</span>
        <span>
          <strong>{activeSource === "external" ? "고용24 연동" : "데모 안내"}</strong>
          {activeSource === "external"
            ? "외부 채용 공고는 고용노동부 고용24에서 실시간으로 조회합니다."
            : "학교 공고는 현재 가상의 샘플이며, 로그인·신청 기능은 준비 중입니다."}
        </span>
      </aside>

      <div className="toolbar">
        <h2>
          {activeSource === "school" ? "학교에 도착한 공고" : "외부 채용 공고"}
          <small>{visibleCount}건</small>
        </h2>
        <form className="job-search-form" onSubmit={searchJobs}>
          <label className="search-field">
            <span className="sr-only">기업명, 직무, 지역 검색</span>
            <span aria-hidden="true">⌕</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="기업명, 직무, 지역 검색"
              type="search"
              maxLength={100}
            />
          </label>
          {activeSource === "external" && (
            <button className="job-search-button" type="submit" disabled={isLoading}>
              {isLoading ? "조회 중" : "검색"}
            </button>
          )}
        </form>
      </div>

      {loadError && activeSource === "external" && (
        <div className="jobs-feedback error" role="alert">
          <p>{loadError}</p>
          <button type="button" onClick={() => setRequestVersion((version) => version + 1)}>다시 시도</button>
        </div>
      )}
      {isLoading && activeSource === "external" && (
        <p className="jobs-feedback" role="status">고용24에서 최신 채용 공고를 불러오는 중입니다.</p>
      )}
      <div className="cards">
        {!isLoading && visibleJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isExpanded={expandedJobId === job.id}
            onToggle={() => toggleJob(job.id)}
          />
        ))}
      </div>
      {!isLoading && !loadError && visibleJobs.length === 0 && (
        <p className="empty">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>
      )}
    </main>
  );
}
