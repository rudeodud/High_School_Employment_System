// DB를 연결하기 전 사용하는 가상 공고입니다.
export type JobSource = "school" | "external";

export type Job = {
  id: number;
  source: JobSource;
  company: string;
  title: string;
  location: string;
  type: string;
  education: string;
  description: string;
};

export const sampleJobs: Job[] = [
  {
    id: 1,
    source: "school",
    company: "미래전자",
    title: "생산관리 현장실습생 모집",
    location: "경기 수원",
    type: "현장실습",
    education: "졸업 예정자",
    description: "전기·전자 관련 학과 학생을 위한 현장실습 예시 공고입니다."
  },
  {
    id: 2,
    source: "school",
    company: "한빛소프트",
    title: "웹 개발 현장실습생 모집",
    location: "서울 금천",
    type: "현장실습",
    education: "졸업 예정자",
    description: "웹 개발에 관심 있는 학생을 위한 예시 공고입니다."
  },
  {
    id: 3,
    source: "external",
    company: "새봄테크",
    title: "기술지원 신입사원 모집",
    location: "경기 성남",
    type: "신입 채용",
    education: "고졸 이상",
    description: "외부 공고 화면을 확인하기 위한 예시입니다. 실제 API는 아직 연결되지 않았습니다."
  },
];
