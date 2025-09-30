import { Clock } from "lucide-react";
import type { BillTopVotesItem } from "@/apis/types/bills";

interface BillProgressProps {
  bill: BillTopVotesItem;
}

export const BillProgress = ({ bill }: BillProgressProps) => {
  return (
    <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6">
      <div className="inline-flex items-center gap-2 mb-3">
        <Clock className="w-6 h-6" />
        <h1 className="text-[22px] font-bold text-gray-800">
          진행 단계
        </h1>
      </div>
      <ul className="space-y-2 ml-[6px]">
        {[
          "접수(발의)",
          "소관위 심사 중",
          "소관위 의결",
          "본회의 부의",
          "본회의 의결",
          "처리 완료",
        ].map((stage, idx) => (
          <li
            key={idx}
            className={`flex items-center gap-3 ${
              idx !== 5 ? "mb-3" : ""
            }`}
          >
            <span
              className={`w-[12px] h-[12px] mr-2 rounded-full ${
                bill.stage === stage
                  ? "bg-blue-500"
                  : "bg-gray-100"
              }`}
            ></span>
            <span
              className={`text-[15px] ${
                bill.stage === stage
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {stage}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
