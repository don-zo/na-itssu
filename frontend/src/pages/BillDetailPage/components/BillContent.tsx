import type { BillTopVotesItem } from "@/apis/types/bills";

interface BillContentProps {
  bill: BillTopVotesItem;
}

function parseMaybeJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as string[];
    return [String(parsed)];
  } catch {
    return [value];
  }
}

export const BillContent = ({ bill }: BillContentProps) => {
  return (
    <>
      <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6">
        <h1 className="text-[22px] font-bold text-gray-800 mb-2">
          한 줄 요약
        </h1>
        <p className="list-disc text-gray-600 space-y-1">
          {bill.summaryLine}
        </p>
      </div>

      <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6">
        <h1 className="text-[22px] font-bold text-gray-800 mb-2">
          제안 배경
        </h1>
        <p className="list-disc text-gray-600 space-y-1">
          {bill.summaryBackground}
        </p>
      </div>

      <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6">
        <h1 className="text-[22px] font-bold text-gray-800 mb-2">
          주요 내용
        </h1>
        <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
          {parseMaybeJsonArray(bill.summaryContent).map(
            (line, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 mr-2 rounded-full bg-blue-500"></span>
                <span className="text-gray-600">{line}</span>
              </li>
            )
          )}
        </ul>
      </div>

      <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6">
        <h1 className="text-[22px] font-bold text-gray-800 mb-2">
          기대 효과
        </h1>
        <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
          {parseMaybeJsonArray(bill.summaryEffect).map(
            (line, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 mr-2 rounded-full bg-blue-500"></span>
                <span className="text-gray-600">{line}</span>
              </li>
            )
          )}
        </ul>
      </div>
    </>
  );
};
