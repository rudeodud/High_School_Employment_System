"use client";

import { FormEvent, useState } from "react";

type School = {
  educationOfficeCode: string;
  educationOffice: string;
  schoolCode: string;
  name: string;
  kind: string;
  region: string;
  address: string;
  phone: string;
  homepage: string;
  coeducation: string;
  foundation: string;
};

type SchoolResponse = {
  schools?: School[];
  totalCount?: number;
  message?: string;
};

function normalizeHomepage(homepage: string) {
  if (!homepage) return null;
  return /^https?:\/\//i.test(homepage) ? homepage : `https://${homepage}`;
}

export default function SchoolSearch() {
  const [query, setQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [message, setMessage] = useState("학교명을 입력해 검색해 보세요.");
  const [isLoading, setIsLoading] = useState(false);

  async function searchSchools(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const schoolName = query.trim();

    if (schoolName.length < 2) {
      setSchools([]);
      setTotalCount(0);
      setMessage("학교명을 두 글자 이상 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("학교 정보를 찾는 중입니다.");

    try {
      const response = await fetch(`/api/schools?name=${encodeURIComponent(schoolName)}`);
      const data = (await response.json()) as SchoolResponse;

      if (!response.ok) {
        throw new Error(data.message ?? "학교 검색에 실패했습니다.");
      }

      const nextSchools = data.schools ?? [];
      setSchools(nextSchools);
      setTotalCount(data.totalCount ?? nextSchools.length);
      setMessage(
        nextSchools.length > 0
          ? `검색 결과 ${data.totalCount ?? nextSchools.length}개 중 최대 20개를 표시합니다.`
          : "일치하는 학교를 찾지 못했습니다.",
      );
    } catch (error) {
      setSchools([]);
      setTotalCount(0);
      setMessage(error instanceof Error ? error.message : "학교 검색에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="school-search" aria-labelledby="school-search-title">
      <div className="school-search-heading">
        <div>
          <p className="eyebrow">나이스 교육정보 개방 포털</p>
          <h2 id="school-search-title">학교 기본정보 검색</h2>
        </div>
        <form onSubmit={searchSchools} className="school-search-form">
          <label htmlFor="school-name" className="sr-only">학교명</label>
          <input
            id="school-name"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 서울공업고등학교"
            autoComplete="off"
          />
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? "검색 중" : "검색"}
          </button>
        </form>
      </div>

      <p className="school-search-message" role="status">
        {message}
        {totalCount > 20 && " 검색어를 더 구체적으로 입력하면 원하는 학교를 빨리 찾을 수 있습니다."}
      </p>

      <div className="school-grid">
        {schools.map((school) => {
          const homepage = normalizeHomepage(school.homepage);

          return (
            <article className="school-card" key={`${school.educationOfficeCode}-${school.schoolCode}`}>
              <div className="tags">
                <span>{school.kind}</span>
                <span className="sample">{school.foundation}</span>
              </div>
              <p className="company">{school.educationOffice} · {school.coeducation}</p>
              <h3>{school.name}</h3>
              <dl className="school-details">
                <div>
                  <dt>주소</dt>
                  <dd>{school.address || "정보 없음"}</dd>
                </div>
                <div>
                  <dt>전화</dt>
                  <dd>{school.phone || "정보 없음"}</dd>
                </div>
              </dl>
              {homepage && (
                <a className="school-homepage" href={homepage} target="_blank" rel="noreferrer">
                  학교 홈페이지 열기
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
