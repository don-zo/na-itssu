import { Calendar, Building2, Users, Target } from "lucide-react";
import type { BillTopVotesItem } from "@/apis/types/bills";

interface BillHeaderProps {
  bill: BillTopVotesItem;
  summaryHighlight: string;
}

export const BillHeader = ({ bill, summaryHighlight }: BillHeaderProps) => {
  return (
    <>
      <div className="inline-flex items-center gap-3 mb-3">
        <p className="text-xs border border-gray-100 bg-gray-100 rounded-full px-2 py-[3px] font-semibold">
          {bill.tag}
        </p>
        <p className="text-xs border border-gray-200 rounded-full px-3 py-[3px] font-semibold">
          {bill.stage}
        </p>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-7">
        {bill.billName}
      </h1>
      <div className="flex justify-between gap-3 mb-8">
        <div className="inline-flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-500">{bill.proposeDate}</p>
        </div>
        <div className="inline-flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-500">{bill.proposerKind}</p>
        </div>
        <div className="inline-flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-500">{bill.proposer}</p>
        </div>
        <div className="inline-flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-500">{summaryHighlight}</p>
        </div>
      </div>
      <div className="h-px bg-gray-200 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-8"></div>
    </>
  );
};
