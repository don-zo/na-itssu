export interface ConferenceData {
  id: number;
  title: string;
  date: string;
  summary: string;
  discussion_items: string[];
  pdf_link_url?: string;
  vod_link_url?: string;
  conf_id?: number;
}

export const mockConferenceData: ConferenceData[] = [
  {
    id: 1,
    conf_id: 1,
    title: "국정감사 결과 보고",
    date: "2024-01-15",
    summary: "2024년도 국정감사 결과를 종합적으로 보고합니다.",
    discussion_items: [
      "교육부 예산 집행 현황 검토",
      "고등교육 정책 방향 논의",
      "교육 불평등 해소 방안",
      "교육부 예산 집행 개선 방안 수립",
      "고등교육 정책 재검토 결정",
    ],
    pdf_link_url: "https://example.com/pdf1.pdf",
    vod_link_url: "https://example.com/vod1.mp4",
  },
  {
    id: 2,
    conf_id: 2,
    title: "예산안 심의",
    date: "2024-01-20",
    summary: "2024년도 정부 예산안에 대한 심의를 진행합니다.",
    discussion_items: [
      "정부 예산안 전체 검토",
      "부처별 예산 배분 논의",
      "예산 효율성 평가",
      "예산안 일부 수정 결정",
      "추가 예산 검토 요청",
    ],
    pdf_link_url: "https://example.com/pdf2.pdf",
    vod_link_url: "https://example.com/vod2.mp4",
  },
  {
    id: 3,
    conf_id: 3,
    title: "법률안 심의",
    date: "2024-01-25",
    summary: "새로운 법률안에 대한 심의를 진행합니다.",
    discussion_items: [
      "개인정보보호법 개정안 검토",
      "디지털 권리 보장 방안",
      "사이버 보안 강화 방안",
      "개인정보보호법 개정안 통과",
      "추가 보완 조항 검토 결정",
    ],
    pdf_link_url: "https://example.com/pdf3.pdf",
    vod_link_url: "https://example.com/vod3.mp4",
  },
  {
    id: 4,
    conf_id: 4,
    title: "정책 질의응답",
    date: "2024-01-30",
    summary: "정부 정책에 대한 질의응답을 진행합니다.",
    discussion_items: [
      "경제 정책 질의",
      "사회 복지 정책 문의",
      "환경 정책 방향 질의",
      "정책 보완 방안 검토",
      "추가 설명 자료 요청",
    ],
    pdf_link_url: "https://example.com/pdf4.pdf",
    vod_link_url: "https://example.com/vod4.mp4",
  },
  {
    id: 5,
    conf_id: 5,
    title: "국정감사 계획",
    date: "2024-02-05",
    summary: "다음 국정감사 계획을 수립합니다.",
    discussion_items: [
      "국정감사 대상 부처 선정",
      "감사 일정 계획",
      "감사 방법론 논의",
      "국정감사 계획 확정",
      "감사팀 구성 방안 결정",
    ],
    pdf_link_url: "https://example.com/pdf5.pdf",
    vod_link_url: "https://example.com/vod5.mp4",
  },
  {
    id: 6,
    conf_id: 6,
    title: "예산 집행 보고",
    date: "2024-02-10",
    summary: "예산 집행 현황을 보고합니다.",
    discussion_items: [
      "분기별 예산 집행 현황",
      "집행 지연 사유 분석",
      "집행 효율성 평가",
      "집행 지연 개선 방안 수립",
      "예산 재배분 검토",
    ],
    pdf_link_url: "https://example.com/pdf6.pdf",
    vod_link_url: "https://example.com/vod6.mp4",
  },
  {
    id: 7,
    conf_id: 7,
    title: "정책 검토",
    date: "2024-02-15",
    summary: "현재 정책들의 효과를 검토합니다.",
    discussion_items: [
      "정책 효과성 분석",
      "정책 개선 방안",
      "정책 연계성 검토",
      "정책 개선 방안 수립",
      "정책 모니터링 강화",
    ],
    pdf_link_url: "https://example.com/pdf7.pdf",
    vod_link_url: "https://example.com/vod7.mp4",
  },
  {
    id: 8,
    conf_id: 8,
    title: "법률 개정안",
    date: "2024-02-20",
    summary: "기존 법률의 개정안을 검토합니다.",
    discussion_items: [
      "노동법 개정안 검토",
      "환경법 개정 방향",
      "법률 시행령 검토",
      "노동법 개정안 통과",
      "환경법 개정안 재검토",
    ],
    pdf_link_url: "https://example.com/pdf8.pdf",
    vod_link_url: "https://example.com/vod8.mp4",
  },
  {
    id: 9,
    conf_id: 9,
    title: "국정감사 결과",
    date: "2024-02-25",
    summary: "국정감사 결과를 종합 정리합니다.",
    discussion_items: [
      "감사 결과 종합 분석",
      "개선 권고사항 정리",
      "후속 조치 방안",
      "개선 권고사항 이행 계획",
      "후속 감사 계획 수립",
    ],
    pdf_link_url: "https://example.com/pdf9.pdf",
    vod_link_url: "https://example.com/vod9.mp4",
  },
];
