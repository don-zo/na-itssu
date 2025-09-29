export interface AgendaItem {
  id: number;
  text: string;
}

export interface DecisionItem {
  id: number;
  text: string;
}

export interface ConferenceData {
  id: number;
  title: string;
  date: string;
  duration: string;
  summary: string;
  agenda: AgendaItem[];
  decision: DecisionItem[];
}

export const mockConferenceData: ConferenceData[] = [
  {
    id: 1,
    title: "국정감사 결과 보고",
    date: "2024-01-15",
    duration: "2시간 30분",
    summary: "2024년도 국정감사 결과를 종합적으로 보고합니다.",
    agenda: [
      { id: 1, text: "교육부 예산 집행 현황 검토" },
      { id: 2, text: "고등교육 정책 방향 논의" },
      { id: 3, text: "교육 불평등 해소 방안" }
    ],
    decision: [
      { id: 1, text: "교육부 예산 집행 개선 방안 수립" },
      { id: 2, text: "고등교육 정책 재검토 결정" }
    ]
  },
  {
    id: 2,
    title: "예산안 심의",
    date: "2024-01-20",
    duration: "3시간 15분",
    summary: "2024년도 정부 예산안에 대한 심의를 진행합니다.",
    agenda: [
      { id: 1, text: "정부 예산안 전체 검토" },
      { id: 2, text: "부처별 예산 배분 논의" },
      { id: 3, text: "예산 효율성 평가" }
    ],
    decision: [
      { id: 1, text: "예산안 일부 수정 결정" },
      { id: 2, text: "추가 예산 검토 요청" }
    ]
  },
  {
    id: 3,
    title: "법률안 심의",
    date: "2024-01-25",
    duration: "1시간 45분",
    summary: "새로운 법률안에 대한 심의를 진행합니다.",
    agenda: [
      { id: 1, text: "개인정보보호법 개정안 검토" },
      { id: 2, text: "디지털 권리 보장 방안" },
      { id: 3, text: "사이버 보안 강화 방안" }
    ],
    decision: [
      { id: 1, text: "개인정보보호법 개정안 통과" },
      { id: 2, text: "추가 보완 조항 검토 결정" }
    ]
  },
  {
    id: 4,
    title: "정책 질의응답",
    date: "2024-01-30",
    duration: "2시간 10분",
    summary: "정부 정책에 대한 질의응답을 진행합니다.",
    agenda: [
      { id: 1, text: "경제 정책 질의" },
      { id: 2, text: "사회 복지 정책 문의" },
      { id: 3, text: "환경 정책 방향 질의" }
    ],
    decision: [
      { id: 1, text: "정책 보완 방안 검토" },
      { id: 2, text: "추가 설명 자료 요청" }
    ]
  },
  {
    id: 5,
    title: "국정감사 계획",
    date: "2024-02-05",
    duration: "1시간 30분",
    summary: "다음 국정감사 계획을 수립합니다.",
    agenda: [
      { id: 1, text: "국정감사 대상 부처 선정" },
      { id: 2, text: "감사 일정 계획" },
      { id: 3, text: "감사 방법론 논의" }
    ],
    decision: [
      { id: 1, text: "국정감사 계획 확정" },
      { id: 2, text: "감사팀 구성 방안 결정" }
    ]
  },
  {
    id: 6,
    title: "예산 집행 보고",
    date: "2024-02-10",
    duration: "2시간 5분",
    summary: "예산 집행 현황을 보고합니다.",
    agenda: [
      { id: 1, text: "분기별 예산 집행 현황" },
      { id: 2, text: "집행 지연 사유 분석" },
      { id: 3, text: "집행 효율성 평가" }
    ],
    decision: [
      { id: 1, text: "집행 지연 개선 방안 수립" },
      { id: 2, text: "예산 재배분 검토" }
    ]
  },
  {
    id: 7,
    title: "정책 검토",
    date: "2024-02-15",
    duration: "1시간 50분",
    summary: "현재 정책들의 효과를 검토합니다.",
    agenda: [
      { id: 1, text: "정책 효과성 분석" },
      { id: 2, text: "정책 개선 방안" },
      { id: 3, text: "정책 연계성 검토" }
    ],
    decision: [
      { id: 1, text: "정책 개선 방안 수립" },
      { id: 2, text: "정책 모니터링 강화" }
    ]
  },
  {
    id: 8,
    title: "법률 개정안",
    date: "2024-02-20",
    duration: "2시간 20분",
    summary: "기존 법률의 개정안을 검토합니다.",
    agenda: [
      { id: 1, text: "노동법 개정안 검토" },
      { id: 2, text: "환경법 개정 방향" },
      { id: 3, text: "법률 시행령 검토" }
    ],
    decision: [
      { id: 1, text: "노동법 개정안 통과" },
      { id: 2, text: "환경법 개정안 재검토" }
    ]
  },
  {
    id: 9,
    title: "국정감사 결과",
    date: "2024-02-25",
    duration: "3시간",
    summary: "국정감사 결과를 종합 정리합니다.",
    agenda: [
      { id: 1, text: "감사 결과 종합 분석" },
      { id: 2, text: "개선 권고사항 정리" },
      { id: 3, text: "후속 조치 방안" }
    ],
    decision: [
      { id: 1, text: "개선 권고사항 이행 계획" },
      { id: 2, text: "후속 감사 계획 수립" }
    ]
  }
];
