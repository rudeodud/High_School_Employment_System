"use client";
import { useState } from "react";
const jobs = [
 { id: 1, source: "school", company: "미래전자", title: "생산관리 현장실습생 모집", location: "경기 수원", type: "현장실습", education: "졸업 예정자", description: "전기·전자 관련 학과 학생을 위한 현장실습 예시 공고입니다." },
 { id: 2, source: "school", company: "한빛소프트", title: "웹 개발 현장실습생 모집", location: "서울 금천", type: "현장실습", education: "졸업 예정자", description: "웹 개발에 관심 있는 학생을 위한 예시 공고입니다." },
 { id: 3, source: "external", company: "새봄테크", title: "기술지원 신입사원 모집", location: "경기 성남", type: "신입 채용", education: "고졸 이상", description: "외부 공고 화면을 확인하기 위한 예시입니다. 실제 API는 아직 연결되지 않았습니다." },
];
export default function Home() {
 const [tab, setTab] = useState("school");
 const [query, setQuery] = useState("");
 const [selected, setSelected] = useState<number | null>(null);
 const filtered = jobs.filter(job => job.source === tab && `${job.company} ${job.title} ${job.location}`.includes(query.trim()));
 return <><header><div className="shell brand">학교 채용 시스템<span>수행평가 프로젝트</span></div></header>
 <main className="shell"><section className="intro"><p className="eyebrow">우리 학교 취업 게시판</p><h1>첫 시작을 위한 기회,<br/>한곳에서 찾아보세요.</h1><p>학교 채용 공고와 외부 취업 정보를 함께 확인하세요.</p></section>
 <aside>현재 표시된 기업과 공고는 모두 가상의 샘플입니다. 로그인·신청·외부 API는 준비 중입니다.</aside>
 <nav aria-label="공고 분류">{[["school", "학교 채용 공고"], ["external", "외부 채용 공고"]].map(([value, label]) => <button key={value} aria-pressed={tab === value} className={tab === value ? "active" : ""} onClick={() => { setTab(value); setSelected(null); }}>{label}</button>)}</nav>
 <div className="toolbar"><h2>{tab === "school" ? "학교에 도착한 공고" : "외부 채용 공고"} <small>{filtered.length}건</small></h2><label><span className="sr-only">기업명, 직무, 지역 검색</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="기업명, 직무, 지역 검색" type="search"/></label></div>
 <div className="cards">{filtered.map(job => <article key={job.id}><div className="tags"><span>{job.type}</span><span className="sample">샘플 공고</span></div><p className="company">{job.company}</p><h3>{job.title}</h3><p className="meta">{job.location} · {job.education}</p><button className="detail" aria-expanded={selected === job.id} onClick={() => setSelected(selected === job.id ? null : job.id)}>{selected === job.id ? "상세 내용 닫기" : "상세 내용 보기"}<span>↗</span></button>{selected === job.id && <div className="description">{job.description}<p>실제 지원은 아직 제공하지 않습니다.</p></div>}</article>)}</div>
 {filtered.length === 0 && <p className="empty">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>}
 <footer>학교 채용 시스템 · 로컬 개발 버전</footer></main></>;
}
