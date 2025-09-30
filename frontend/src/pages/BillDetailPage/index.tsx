import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { ROUTES } from "@/routes/path";
import { ArrowLeft } from "lucide-react";
import { billsService } from "@/apis/services/bills";
import type { BillTopVotesItem } from "@/apis/types/bills";
import { getVoteStatus, setVoteStatus } from "@/utils/voteStorage";
import { BillHeader } from "./components/BillHeader";
import { BillContent } from "./components/BillContent";
import { BillProgress } from "./components/BillProgress";
import { VoteSection } from "./components/VoteSection";

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

  // 로컬스토리지에서 투표 여부 동기화
  useEffect(() => {
    if (!billId) return;
    const status = getVoteStatus(billId);
    setHasVoted(status.voted);
  }, [billId]);

  const handleVoteAgree = async () => {
    if (!billId || voting || hasVoted) return;

    try {
      setVoting(true);
      await billsService.voteAgree(billId);
      setVoteStatus(billId, "agree");
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
      setVoteStatus(billId, "disagree");
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
              <p className="text-gray-600 mb-8">{error}</p>
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
              <div className="max-w-[960px] mx-auto text-left">
                <BillHeader bill={bill} summaryHighlight={summaryHighlight} />

                <div className="grid grid-cols-3 gap-6 overflow-visible">
                  <div className="col-span-2">
                    <BillContent bill={bill} />
                    <BillProgress bill={bill} />
                  </div>

                  <VoteSection
                    bill={bill}
                    hasVoted={hasVoted}
                    voting={voting}
                    onVoteAgree={handleVoteAgree}
                    onVoteDisagree={handleVoteDisagree}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
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
