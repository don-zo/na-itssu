export interface Bill {
  id: number;
  title: string;
  status: string;
  proposer: string;
  date: string;
  summary: string;
}

export const sampleBills: Bill[] = [
  {
    id: 1,
    title: "국가재정법 일부개정법률안",
    status: "심사중",
    proposer: "정부",
    date: "2024-01-15",
    summary: "국가재정의 건전성 확보를 위한 법률 개정안입니다."
  },
  {
    id: 2,
    title: "개인정보보호법 일부개정법률안",
    status: "통과",
    proposer: "국회의원",
    date: "2024-01-20",
    summary: "개인정보 보호 강화를 위한 법률 개정안입니다."
  },
  {
    id: 3,
    title: "교육기본법 일부개정법률안",
    status: "심사중",
    proposer: "정부",
    date: "2024-01-25",
    summary: "교육의 기본 방향을 제시하는 법률 개정안입니다."
  },
  {
    id: 4,
    title: "환경보전법 일부개정법률안",
    status: "심사중",
    proposer: "국회의원",
    date: "2024-01-30",
    summary: "환경보전을 위한 법률 개정안입니다."
  },
  {
    id: 5,
    title: "노동기본법 일부개정법률안",
    status: "통과",
    proposer: "정부",
    date: "2024-02-05",
    summary: "근로자의 권익 보호를 위한 법률 개정안입니다."
  },
  {
    id: 6,
    title: "의료법 일부개정법률안",
    status: "심사중",
    proposer: "국회의원",
    date: "2024-02-10",
    summary: "의료서비스 개선을 위한 법률 개정안입니다."
  },
  {
    id: 7,
    title: "교통기본법 일부개정법률안",
    status: "심사중",
    proposer: "정부",
    date: "2024-02-15",
    summary: "교통안전 강화를 위한 법률 개정안입니다."
  },
  {
    id: 8,
    title: "문화기본법 일부개정법률안",
    status: "심사중",
    proposer: "국회의원",
    date: "2024-02-20",
    summary: "문화진흥을 위한 법률 개정안입니다."
  },
  {
    id: 9,
    title: "과학기술기본법 일부개정법률안",
    status: "통과",
    proposer: "정부",
    date: "2024-02-25",
    summary: "과학기술 발전을 위한 법률 개정안입니다."
  },
  {
    id: 10,
    title: "정보통신기본법 일부개정법률안",
    status: "심사중",
    proposer: "국회의원",
    date: "2024-03-01",
    summary: "정보통신 기술 발전을 위한 법률 개정안입니다."
  },
  {
    id: 11,
    title: "사회보장기본법 일부개정법률안",
    status: "심사중",
    proposer: "정부",
    date: "2024-03-05",
    summary: "사회보장제도 강화를 위한 법률 개정안입니다."
  },
  {
    id: 12,
    title: "국방기본법 일부개정법률안",
    status: "통과",
    proposer: "국회의원",
    date: "2024-03-10",
    summary: "국방력 강화를 위한 법률 개정안입니다."
  },
  {
    id: 13,
    title: "농업기본법 일부개정법률안",
    status: "심사중",
    proposer: "정부",
    date: "2024-03-15",
    summary: "농업 발전을 위한 법률 개정안입니다."
  },
  {
    id: 14,
    title: "수산업기본법 일부개정법률안",
    status: "심사중",
    proposer: "국회의원",
    date: "2024-03-20",
    summary: "수산업 진흥을 위한 법률 개정안입니다."
  },
  {
    id: 15,
    title: "에너지기본법 일부개정법률안",
    status: "통과",
    proposer: "정부",
    date: "2024-03-25",
    summary: "에너지 정책 개선을 위한 법률 개정안입니다."
  },
  {
    id: 16,
    title: "물관리기본법 일부개정법률안",
    status: "심사중",
    proposer: "국회의원",
    date: "2024-03-30",
    summary: "물 관리 체계 개선을 위한 법률 개정안입니다."
  },
  {
    id: 17,
    title: "산업기술혁신촉진법 일부개정법률안",
    status: "심사중",
    proposer: "정부",
    date: "2024-04-05",
    summary: "산업기술 혁신 촉진을 위한 법률 개정안입니다."
  },
  {
    id: 18,
    title: "중소기업기본법 일부개정법률안",
    status: "통과",
    proposer: "국회의원",
    date: "2024-04-10",
    summary: "중소기업 지원 강화를 위한 법률 개정안입니다."
  },
  {
    id: 19,
    title: "지역균형발전특별법 일부개정법률안",
    status: "심사중",
    proposer: "정부",
    date: "2024-04-15",
    summary: "지역균형발전을 위한 법률 개정안입니다."
  },
  {
    id: 20,
    title: "국토기본법 일부개정법률안",
    status: "심사중",
    proposer: "국회의원",
    date: "2024-04-20",
    summary: "국토 계획 개선을 위한 법률 개정안입니다."
  }
];
