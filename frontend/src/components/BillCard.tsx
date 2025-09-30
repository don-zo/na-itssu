import React, { useEffect, useState } from "react";
import { Calendar, Users, ThumbsUp, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getVoteStatus, setVoteStatus } from "@/utils/voteStorage";
import { billsService } from "@/apis/services/bills";

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
  // 서버에서 내려오는 투표 여부
  initialHasVoted?: boolean;
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
  initialHasVoted,
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
  const [hasVoted, setHasVoted] = useState(!!initialHasVoted);
  const [voting, setVoting] = useState(false);

  // 기존 투표 여부 동기화 (로컬스토리지)
  useEffect(() => {
    // 서버 hasVoted가 true면 최우선 반영
    if (initialHasVoted) {

      setHasVoted(true);
      return;
    }
    // 서버 정보 없을 때 로컬스토리지 확인
    const status = getVoteStatus(id);
    if (status.voted) setHasVoted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initialHasVoted]);

  const agreePercent = totalVotes
    ? ((agreeVotes / totalVotes) * 100).toFixed(1)
    : "0.0";
  const disagreePercent = totalVotes
    ? ((disagreeVotes / totalVotes) * 100).toFixed(1)
    : "0.0";

  const handleAgree = async () => {
    if (hasVoted || voting) return;
    try {
      setVoting(true);
      await billsService.voteAgree(id);

      // 클라이언트 표시값 1 증가 (서버와 일치)
      setAgreeVotes((v) => v + 1);
      setTotalVotes((v) => v + 1);
      setHasVoted(true);
      setVoteStatus(id, "agree");
      if (onAgreeClick) onAgreeClick();
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 2000);
    } catch (e) {
      console.error("찬성 투표 실패:", e);
      alert("투표에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setVoting(false);
    }
  };

  const handleDisagree = async () => {
    if (hasVoted || voting) return;
    try {
      setVoting(true);
      await billsService.voteDisagree(id);

      // 클라이언트 표시값 1 증가 (서버와 일치)
      setDisagreeVotes((v) => v + 1);
      setTotalVotes((v) => v + 1);
      setHasVoted(true);
      setVoteStatus(id, "disagree");
      if (onDisagreeClick) onDisagreeClick();
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 2000);
    } catch (e) {
      console.error("반대 투표 실패:", e);
      alert("투표에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setVoting(false);
    }
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
          <span className="px-1 text-[15px] font-medium">현재 투표 현황</span>
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
            disabled={hasVoted || voting}
            className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsUp className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">찬성</span>
          </button>
          <button
            onClick={handleDisagree}
            disabled={hasVoted || voting}
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
