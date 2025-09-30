export interface BillTopVotesItem {
  id: number;
  billNo: number;
  billName: string;
  tag: string;
  proposeDate: string; // YYYY-MM-DD
  totalCount: number;
  agreeCount: number;
  disagreeCount: number;
  hasVoted: boolean;
  summaryContent: string;
  summaryBackground: string;
  summaryHighlight: string;
  summaryEffect: string;
  summaryLine: string;
  stage: string;
  proposerKind: string;
  proposer: string;
}

export interface BillPageResponse {
  size: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  page: number;
  content: BillTopVotesItem[];
  totalElements: number;
}

export interface BillPageParams {
  page?: number;
  size?: number;
  sort?: string;
}
