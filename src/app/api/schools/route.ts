import { NextResponse } from "next/server";

type NeisSchool = {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  SCHUL_KND_SC_NM: string;
  LCTN_SC_NM: string;
  ORG_RDNMA: string;
  ORG_RDNDA: string;
  ORG_TELNO: string;
  HMPG_ADRES: string;
  COEDU_SC_NM: string;
  FOND_SC_NM: string;
};

type NeisResponse = {
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
  schoolInfo?: [
    {
      head?: Array<{
        list_total_count?: number;
        RESULT?: {
          CODE: string;
          MESSAGE: string;
        };
      }>;
    },
    { row?: NeisSchool[] },
  ];
};

export async function GET(request: Request) {
  const apiKey = process.env.NEIS_API_KEY;
  const name = new URL(request.url).searchParams.get("name")?.trim() ?? "";

  if (!apiKey) {
    return NextResponse.json(
      { message: "서버에 NEIS_API_KEY가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  if (name.length < 2) {
    return NextResponse.json(
      { message: "학교명을 두 글자 이상 입력해 주세요." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    KEY: apiKey,
    Type: "json",
    pIndex: "1",
    pSize: "20",
    SCHUL_NM: name,
  });

  try {
    const response = await fetch(`https://open.neis.go.kr/hub/schoolInfo?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`NEIS 응답 상태: ${response.status}`);
    }

    const data = (await response.json()) as NeisResponse;
    const result = data.RESULT ?? data.schoolInfo?.[0].head?.find((item) => item.RESULT)?.RESULT;

    if (result && result.CODE !== "INFO-000") {
      if (result.CODE === "INFO-200") {
        return NextResponse.json({ schools: [], totalCount: 0 });
      }

      return NextResponse.json(
        { message: result.MESSAGE || "나이스 API 요청에 실패했습니다." },
        { status: 502 },
      );
    }

    const rows = data.schoolInfo?.[1]?.row ?? [];
    const totalCount =
      data.schoolInfo?.[0].head?.find((item) => item.list_total_count !== undefined)
        ?.list_total_count ?? rows.length;

    const schools = rows.map((school) => ({
      educationOfficeCode: school.ATPT_OFCDC_SC_CODE,
      educationOffice: school.ATPT_OFCDC_SC_NM,
      schoolCode: school.SD_SCHUL_CODE,
      name: school.SCHUL_NM,
      kind: school.SCHUL_KND_SC_NM,
      region: school.LCTN_SC_NM,
      address: `${school.ORG_RDNMA ?? ""} ${school.ORG_RDNDA ?? ""}`.trim(),
      phone: school.ORG_TELNO,
      homepage: school.HMPG_ADRES,
      coeducation: school.COEDU_SC_NM,
      foundation: school.FOND_SC_NM,
    }));

    return NextResponse.json({ schools, totalCount });
  } catch (error) {
    console.error("나이스 학교정보 조회 실패", error);
    return NextResponse.json(
      { message: "나이스 학교정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
