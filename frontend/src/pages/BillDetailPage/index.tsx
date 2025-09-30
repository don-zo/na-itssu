import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Chatbot from "@/components/chatbot";
import { ROUTES } from "@/routes/path";
import { ArrowLeft, Calendar, Building2, Users, Target, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { billsService } from "@/apis/services/bills";
import type { BillTopVotesItem } from "@/apis/types/bills";

function parseMaybeJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as string[];
    return [String(parsed)];
  } catch {
    return [value];
  }
}

function stripSquareBrackets(text: string): string {
  if (!text) return text;
  return text.replace(/^\[/, "").replace(/\]$/, "");
}

export const BillDetailPage = () => {
  const { id } = useParams();
  const billId = Number(id);
  
  const [bill, setBill] = useState<BillTopVotesItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchBill = async () => {
      if (!billId) {
        setError("잘못된 법안 ID입니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const billData = await billsService.getBillById(billId);
        setBill(billData);
      } catch (err) {
        console.error("법안 데이터 로드 실패:", err);
        setError("법안 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId]);

  const handleVoteAgree = async () => {
    if (!billId || voting || hasVoted) return;
    
    try {
      setVoting(true);
      await billsService.voteAgree(billId);
      // 투표 후 데이터 다시 로드
      const updatedBill = await billsService.getBillById(billId);
      setBill(updatedBill);
      setHasVoted(true);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 2000);
    } catch (err) {
      console.error("찬성 투표 실패:", err);
      alert("투표에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setVoting(false);
    }
  };

  const handleVoteDisagree = async () => {
    if (!billId || voting || hasVoted) return;
    
    try {
      setVoting(true);
      await billsService.voteDisagree(billId);
      // 투표 후 데이터 다시 로드
      const updatedBill = await billsService.getBillById(billId);
      setBill(updatedBill);
      setHasVoted(true);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 2000);
    } catch (err) {
      console.error("반대 투표 실패:", err);
      alert("투표에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setVoting(false);
    }
  };

  const notFound = !loading && !bill;
  const summaryHighlight = bill
    ? stripSquareBrackets(bill.summaryHighlight)
    : "";

  return (
    <>
      <Header />
      <div className="bg-gray-50 pt-20">
        <div className="text-center container mx-auto px-4 pt-5 pb-8">
          <div className="max-w-[960px] mx-auto text-left mb-4">
            <Link
              to={ROUTES.BILLS.DEFAULT}
              className="inline-flex items-center gap-4 px-4 py-2 rounded-lg text-sm text-black hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
              aria-label="법률안 목록으로 돌아가기"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>목록으로 돌아가기</span>
            </Link>
          </div>
          {loading ? (
            <>
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">법안 정보를 불러오는 중...</p>
                </div>
              </div>
            </>
          ) : error ? (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                오류가 발생했습니다
              </h1>
              <p className="text-gray-600 mb-8">
                {error}
              </p>
            </>
          ) : notFound ? (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                법률안을 찾을 수 없습니다
              </h1>
              <p className="text-gray-600 mb-8">
                요청하신 법률안이 존재하지 않거나 잘못된 경로입니다.
              </p>
            </>
          ) : bill ? (
            <>
              <div className="max-w-[960px] mx-auto text-left mb-20">
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

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
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
                  </div>

                  <div className="col-span-1">
                    <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-4 sticky top-24 h-fit">
                      <h1 className="text-[22px] font-bold text-gray-800 mb-1">
                      시민 의견 투표
                      </h1>
                      <p className="text-sm text-gray-500 mb-4">
                        이 법률안에 대한 의견을 투표해주세요.
                      </p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-3">
                        {hasVoted ? (
                          <>
                            <span className="text-blue-600">
                              찬성{" "}
                              {bill.totalCount > 0 ? ((bill.agreeCount / bill.totalCount) * 100).toFixed(1) : '0.0'}%
                            </span>
                            <span className="text-red-500">
                              반대{" "}
                              {bill.totalCount > 0 ? ((bill.disagreeCount / bill.totalCount) * 100).toFixed(1) : '0.0'}%
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 ml-1">투표 후 결과가 표시됩니다</span>
                        )}
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full flex overflow-hidden">
                        {hasVoted ? (
                          <>
                            <div
                              className="bg-blue-500 h-4"
                              style={{ width: `${(bill.agreeCount / bill.totalCount) * 100}%` }}
                            ></div>
                            <div
                              className="bg-red-500 h-4"
                              style={{ width: `${(bill.disagreeCount / bill.totalCount) * 100}%` }}
                            ></div>
                          </>
                        ) : (
                          <div className="bg-gray-300 h-4 w-full"></div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-6 text-center">총 {bill.totalCount.toLocaleString()}명 참여</p>

                    <div className="border-t border-gray-200 mb-6"></div>

                      <div className="mb-2 flex flex-col gap-3">
                        <button 
                          onClick={handleVoteAgree}
                          disabled={voting || hasVoted}
                          className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ThumbsUp className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-700 text-sm">
                            {voting ? "투표 중..." : hasVoted ? "투표 완료" : "찬성합니다"}
                          </span>
                        </button>
                        <button 
                          onClick={handleVoteDisagree}
                          disabled={voting || hasVoted}
                          className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ThumbsDown className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-gray-700 text-sm">
                            {voting ? "투표 중..." : hasVoted ? "투표 완료" : "반대합니다"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <a
                      href={`https://search.naver.com/search.naver?query=${encodeURIComponent(bill.billName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-6 py-3 border border-gray-200 text-[17px] rounded-xl bg-white font-semibold hover:bg-gray-50 text-center inline-block"
                    >
                      관련 내용 검색
                    </a>
                  </div>

                
                </div>
              </div>            
            </>
          ) : null}
        </div>
      </div>
      <div className="bg-gray-50 p-8">
        <Chatbot />
      </div>
      
      {showSnackbar && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition transform animate-bounce z-50">
          투표가 반영되었습니다!
        </div>
      )}
    </>
  );
};

export default BillDetailPage;