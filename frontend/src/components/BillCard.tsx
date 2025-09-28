import React, { useState } from "react";
import { Calendar, Users, ThumbsUp, ThumbsDown } from "lucide-react";

export interface BillCardProps {
  category: string;
  title: string;
  date: string;
  description: string;
  participants: number;
  agreeRate: number;
  disagreeRate: number;
}

const BillCard: React.FC<BillCardProps> = ({
  category,
  title,
  date,
  description,
  participants,
  agreeRate,
  disagreeRate,
}) => {
  const [totalVotes, setTotalVotes] = useState(participants);
  const [agreeVotes, setAgreeVotes] = useState(
    Math.round((participants * agreeRate) / 100)
  );
  const [disagreeVotes, setDisagreeVotes] = useState(
    Math.round((participants * disagreeRate) / 100)
  );
  const [showSnackbar, setShowSnackbar] = useState(false);

  const agreePercent = totalVotes
    ? ((agreeVotes / totalVotes) * 100).toFixed(1)
    : "0.0";
  const disagreePercent = totalVotes
    ? ((disagreeVotes / totalVotes) * 100).toFixed(1)
    : "0.0";

  const handleAgree = () => {
    setAgreeVotes(agreeVotes + 1);
    setTotalVotes(totalVotes + 1);

    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 2000);
  };

  const handleDisagree = () => {
    setDisagreeVotes(disagreeVotes + 1);
    setTotalVotes(totalVotes + 1);

    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col gap-3 w-[360px]">
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
          {category}
        </span>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
      </div>

      <div className="text-left">
        <h3 className="text-lg font-semibold pl-1">{title}</h3>
        <p className="text-sm text-gray-500 pl-1 pt-5 line-clamp-3">
          {description}
        </p>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-800">
        <span className="px-1 pt-3 text-sm">현재 투표 현황</span>
        <div className="flex items-center gap-1 font-semibold">
          <Users className="w-4 h-4" />
          <span>{totalVotes.toLocaleString()}명 참여</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-blue-600">찬성 {agreePercent}%</span>
          <span className="text-red-500">반대 {disagreePercent}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full flex overflow-hidden">
          <div
            className="bg-blue-500 h-3"
            style={{ width: `${agreePercent}%` }}
          ></div>
          <div
            className="bg-red-500 h-3"
            style={{ width: `${disagreePercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          onClick={handleAgree}
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl hover:bg-blue-50"
        >
          <ThumbsUp className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-700">찬성</span>
        </button>
        <button
          onClick={handleDisagree}
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl hover:bg-red-50"
        >
          <ThumbsDown className="w-4 h-4 text-red-500" />
          <span className="font-medium text-gray-700">반대</span>
        </button>
      </div>

      {showSnackbar && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition transform animate-bounce">
          투표가 반영되었습니다!
        </div>
      )}

      <button className="mt-2 py-2 rounded-xl bg-blue-50 text-blue-700 font-medium hover:bg-blue-100">
        법률안 자세히 보기
      </button>
    </div>
  );
};

export default BillCard;
