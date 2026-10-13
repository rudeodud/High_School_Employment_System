"use client";

import { createContext, useContext, useState } from "react";
import type { JobSource } from "@/data/jobs";

type JobSourceContextValue = {
  activeSource: JobSource;
  setActiveSource: (source: JobSource) => void;
};

const JobSourceContext = createContext<JobSourceContextValue | null>(null);

// 상단 메뉴와 공고 목록이 같은 선택 값을 사용하도록 합니다.
export function JobSourceProvider({ children }: { children: React.ReactNode }) {
  const [activeSource, setActiveSource] = useState<JobSource>("school");

  return (
    <JobSourceContext.Provider value={{ activeSource, setActiveSource }}>
      {children}
    </JobSourceContext.Provider>
  );
}

export function useJobSource() {
  const context = useContext(JobSourceContext);

  if (!context) {
    throw new Error("useJobSource는 JobSourceProvider 안에서 사용해야 합니다.");
  }

  return context;
}
