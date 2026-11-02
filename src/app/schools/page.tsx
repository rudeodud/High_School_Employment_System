import SchoolSearch from "@/components/SchoolSearch";

export default function SchoolsPage() {
  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">학교 정보</p>
        <h1>전국 학교 정보를<br />빠르게 찾아보세요.</h1>
        <p>나이스 교육정보 개방 포털에서 제공하는 최신 학교 기본정보를 조회합니다.</p>
      </section>

      <SchoolSearch />
    </main>
  );
}
