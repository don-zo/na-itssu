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
  }
];
