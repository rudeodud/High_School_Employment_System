import { NextResponse } from "next/server";
import type { Job } from "@/data/jobs";

const WORK24_LIST_URL =
  "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do";

function decodeXml(value: string) {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code: string) => {
      const radix = code[0].toLowerCase() === "x" ? 16 : 10;
      const number = Number.parseInt(radix === 16 ? code.slice(1) : code, radix);
      return Number.isFinite(number) ? String.fromCodePoint(number) : "";
    })
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function readTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseJobs(xml: string): { jobs: Job[]; totalCount: number } {
  const jobs = Array.from(xml.matchAll(/<wanted(?:\s[^>]*)?>([\s\S]*?)<\/wanted>/gi)).map(
    ([, item]) => {
      const salary = [readTag(item, "salTpNm"), readTag(item, "sal")]
        .filter(Boolean)
        .join(" ");
      const career = readTag(item, "career") || "경력 무관";
      const workType = readTag(item, "holidayTpNm") || "채용 공고";
      const detailUrl = readTag(item, "wantedInfoUrl");

      return {
        id: readTag(item, "wantedAuthNo"),
        source: "external" as const,
        company: readTag(item, "company") || "기업명 미제공",
        title: readTag(item, "title") || "채용 제목 미제공",
        location: readTag(item, "region") || readTag(item, "basicAddr") || "지역 미제공",
        type: workType,
        education: readTag(item, "minEdubg") || "학력 무관",
        description: [readTag(item, "indTpNm"), career].filter(Boolean).join(" · "),
        salary: salary || undefined,
        deadline: readTag(item, "closeDt") || undefined,
        detailUrl: /^https?:\/\//i.test(detailUrl) ? detailUrl : undefined,
        provider: "고용24",
      } satisfies Job;
    },
  );

  const totalCount = Number.parseInt(readTag(xml, "total"), 10);
  return { jobs: jobs.filter((job) => job.id), totalCount: Number.isFinite(totalCount) ? totalCount : jobs.length };
}

export async function GET(request: Request) {
  const apiKey = process.env.RECRUITMENT_API_KEY;
  const searchParams = new URL(request.url).searchParams;
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), 1000) : 1;

  if (!apiKey) {
    return NextResponse.json(
      { message: "서버에 RECRUITMENT_API_KEY가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  if (keyword.length > 100) {
    return NextResponse.json(
      { message: "검색어는 100자 이하로 입력해 주세요." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    authKey: apiKey,
    callTp: "L",
    returnType: "XML",
    startPage: String(page),
    display: "20",
    sortOrderBy: "DESC",
  });
  if (keyword) params.set("keyword", keyword);

  try {
    const response = await fetch(`${WORK24_LIST_URL}?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`고용24 응답 상태: ${response.status}`);
    }

    const xml = await response.text();
    const errorMessage = readTag(xml, "error") || readTag(xml, "message");

    if (errorMessage.includes("개인회원은 사용할 수 없는")) {
      return NextResponse.json(
        {
          code: "WORK24_ENTERPRISE_ONLY",
          message:
            "이 인증키는 개인회원 키입니다. 고용24 채용정보 OPEN-API는 기업회원 전용이므로 학교·기관 또는 사업자 기업회원 계정으로 이용 승인을 받아야 합니다.",
        },
        { status: 403 },
      );
    }

    if (errorMessage && !xml.includes("<wantedRoot")) {
      return NextResponse.json({ message: errorMessage }, { status: 502 });
    }

    return NextResponse.json(parseJobs(xml));
  } catch (error) {
    console.error("고용24 채용정보 조회 실패", error);
    return NextResponse.json(
      { message: "고용24 채용정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
