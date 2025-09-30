export interface BillTopVotesItem {
  id: number;
  billNo: number;
  billName: string;
  tag: string;
  proposeDate: string; // YYYY-MM-DD
  totalCount: number;
  agreeCount: number;
  disagreeCount: number;
  summaryContent: string;
  summaryBackground: string;
  summaryHighlight: string;
  summaryEffect: string;
  summaryLine: string;
  stage: string;
  proposerKind: string;
  proposer: string;
}

