import SchoolSearch from "@/components/SchoolSearch";

export default function SchoolsPage() {
  return (
    <main className="shell">
      <section className="intro intro--compact">
        <p className="eyebrow"><span aria-hidden="true" /> NEIS OPEN API</p>
        <h1>우리 학교의 정보를<br /><em>한 번에 찾아보세요.</em></h1>
        <p className="hero-description">나이스 교육정보 개방 포털에서 제공하는 최신 학교 기본정보를 조회합니다.</p>
      </section>

      <SchoolSearch />
    </main>
  );
}
