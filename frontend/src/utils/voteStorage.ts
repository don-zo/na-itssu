type VoteChoice = "agree" | "disagree";

interface StoredVotesMap {
  [billId: string]: {
    choice: VoteChoice;
    timestamp: number;
  };
}

const STORAGE_KEY = "na_itssu_votes";

function safeParse(json: string | null): StoredVotesMap {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json) as StoredVotesMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getVoteStatus(
  billId: number | string
): { voted: boolean; choice?: VoteChoice } {
  const data = safeParse(localStorage.getItem(STORAGE_KEY));
  const record = data[String(billId)];
  if (!record) return { voted: false };
  return { voted: true, choice: record.choice };
}

export function setVoteStatus(billId: number | string, choice: VoteChoice): void {
  const data = safeParse(localStorage.getItem(STORAGE_KEY));
  data[String(billId)] = { choice, timestamp: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


