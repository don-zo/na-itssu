import React, { useState } from "react";
import { Calendar, Users, ThumbsUp, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface BillCardProps {
  id: number;
  category: string;
  title: string;
  date: string;
  description: string;
  participants: number;
  agreeRate: number;
  disagreeRate: number;
  width: string;
  isHot?: boolean;
  onAgreeClick?: () => void;
  onDisagreeClick?: () => void;
}

const BillCard: React.FC<BillCardProps> = ({
  id,
  category,
  title,
  date,
  description,
  participants,
  agreeRate,
  disagreeRate,
  width = "360px",
  isHot = false,
  onAgreeClick,
  onDisagreeClick,
}) => {
  const navigate = useNavigate();

  const [totalVotes, setTotalVotes] = useState(participants);
  const [agreeVotes, setAgreeVotes] = useState(
    Math.round((participants * agreeRate) / 100)
  );
  const [disagreeVotes, setDisagreeVotes] = useState(
    Math.round((participants * disagreeRate) / 100)
  );
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const agreePercent = totalVotes
    ? ((agreeVotes / totalVotes) * 100).toFixed(1)
    : "0.0";
  const disagreePercent = totalVotes
    ? ((disagreeVotes / totalVotes) * 100).toFixed(1)
    : "0.0";

  const handleAgree = () => {
    if (hasVoted) return;
    setAgreeVotes(agreeVotes + 1);
    setTotalVotes(totalVotes + 1);
    setHasVoted(true);

    if (onAgreeClick) onAgreeClick();

    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 2000);
  };

  const handleDisagree = () => {
    if (hasVoted) return;
    setDisagreeVotes(disagreeVotes + 1);
    setTotalVotes(totalVotes + 1);
    setHasVoted(true);

    if (onDisagreeClick) onDisagreeClick();

    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 2000);
  };

  const handleDetail = () => {
    navigate(`/bills/${id}`);
  };

  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col justify-between"
      style={{ 
        width, 
        ...(isHot ? {} : { height: "390px" })
      }}
    >
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span className="px-3 py-1 mb-1 bg-gray-100 rounded-full text-xs font-medium">
          {category}
        </span>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
      </div>

      <div className="text-left">
        <h3 className="text-black text-lg font-semibold pl-1 line-clamp-2 leading-6 h-[3rem] mb-2">{title}</h3>
        <p className="text-sm text-gray-500 pl-1 mt-2 line-clamp-3 h-[4.8rem]">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm text-gray-800 pt-3">
          <span className="px-1 text-sm font-medium">현재 투표 현황</span>
          <div className="flex items-center gap-1 font-semibold">
            <Users className="w-4 h-4" />
            <span>{totalVotes.toLocaleString()}명 참여</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            {hasVoted ? (
              <>
                <span className="text-blue-600">찬성 {agreePercent}%</span>
                <span className="text-red-500">반대 {disagreePercent}%</span>
              </>
            ) : (
              <span className="text-gray-500 ml-1">투표 후 결과가 표시됩니다</span>
            )}
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full flex overflow-hidden">
            {hasVoted ? (
              <>
                <div
                  className="bg-blue-500 h-3"
                  style={{ width: `${agreePercent}%` }}
                ></div>
                <div
                  className="bg-red-500 h-3"
                  style={{ width: `${disagreePercent}%` }}
                ></div>
              </>
            ) : (
              <div className="bg-gray-300 h-3 w-full"></div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAgree}
            disabled={hasVoted}
            className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsUp className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">찬성</span>
          </button>
          <button
            onClick={handleDisagree}
            disabled={hasVoted}
            className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsDown className="w-4 h-4 text-red-500" />
            <span className="font-medium text-gray-700">반대</span>
          </button>
        </div>
      </div>

      {showSnackbar && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition transform animate-bounce">
          투표가 반영되었습니다!
        </div>
      )}

      <button 
        className="mt-2 py-2 rounded-xl bg-blue-50 text-blue-700 font-medium hover:bg-blue-100"
        onClick={handleDetail}
      >
        법률안 자세히 보기
      </button>
    </div>
  );
};

export default BillCard;
