import type { Job } from "@/data/jobs";

type JobCardProps = {
  job: Job;
  isExpanded: boolean;
  onToggle: () => void;
};

// 공고 한 개의 표시를 담당합니다. 펼침 상태는 부모 화면에서 관리합니다.
export default function JobCard({ job, isExpanded, onToggle }: JobCardProps) {
  return (
    <article className="job-card">
      <div className="job-card-header">
        <span className="company-avatar" aria-hidden="true">{job.company.slice(0, 1)}</span>
        <div className="tags">
          <span>{job.type}</span>
          <span className="sample">{job.isSample ? "샘플" : job.provider ?? "외부"}</span>
        </div>
      </div>
      <p className="company">{job.company}</p>
      <h3>{job.title}</h3>
      <p className="meta"><span>⌖</span> {job.location}<span className="meta-divider" />{job.education}</p>
      <button
        className="detail"
        aria-expanded={isExpanded}
        aria-controls={`job-description-${job.id}`}
        onClick={onToggle}
      >
        {isExpanded ? "상세 내용 닫기" : "상세 내용 보기"}
        <span className={isExpanded ? "detail-arrow open" : "detail-arrow"} aria-hidden="true">↓</span>
      </button>
      <div id={`job-description-${job.id}`} hidden={!isExpanded}>
        <div className="description">
          <p className="description-summary">{job.description}</p>
          {job.salary && <p><strong>임금</strong> {job.salary}</p>}
          {job.deadline && <p><strong>마감일</strong> {job.deadline}</p>}
          {job.detailUrl ? (
            <>
              <a
                className="job-source-link"
                href={job.detailUrl}
                target="_blank"
                rel="noreferrer"
              >
                채용정보 제공사이트로 이동
              </a>
              <p className="source-notice">
                자료 출처: 고용24 · 본 자료는 고용노동부 고용24에서 제공된 정보이며,
                무단복제 및 배포를 금지합니다.
              </p>
            </>
          ) : (
            <p>실제 지원은 아직 제공하지 않습니다.</p>
          )}
        </div>
      </div>
    </article>
  );
}
