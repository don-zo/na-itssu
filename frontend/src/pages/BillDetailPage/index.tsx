import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Chatbot from "@/components/chatbot";
import { ROUTES } from "@/routes/path";
import { ArrowLeft, Calendar, Building2, Users, Target } from "lucide-react";

type DetailBillData = {
  summaryContent: string; // JSON 배열 문자열 형태
  proposerKind: string;
  proposer: string;
  summaryBackground: string; // JSON 배열 문자열 형태
  disagreeCount: number;
  totalCount: number;
  billName: string;
  summaryHighlight: string;
  stage: string;
  summaryEffect: string; // JSON 배열 문자열 형태
  agreeCount: number;
  summaryLine: string;
  id: number;
  tag: string;
  billNo: number;
  proposeDate: string;
};

const dataById: Record<number, DetailBillData> = {
  1: {
    summaryContent:
      "[\"지방세특례제한법 일부개정법률안은 중소기업의 창업 지원 대상을 확대하는 내용을 담고 있음\"]",
    proposerKind: "의원",
    proposer: "채현일의원 등 11인",
    summaryBackground:
      "[\"현행법은 중소기업의 경쟁력 강화를 위해 중소기업이 창업할 경우 취득세 및 재산세를 감면해주고 있음\"]",
    disagreeCount: 143,
    totalCount: 1377,
    billName: "지방세특례제한법 일부개정법률안",
    summaryHighlight: "[중소기업 창업 지원 대상 확대]",
    stage: "접수(발의)",
    summaryEffect: "[\"중소기업 창업 지원 대상 확대\"]",
    agreeCount: 1234,
    summaryLine: "중소기업 창업 지원 대상을 확대하는 법안이 발의됨",
    id: 1,
    tag: "경제",
    billNo: 2213340,
    proposeDate: "2025-09-26",
  },
};

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

  const bill = useMemo(() => {
    if (!billId) return undefined;
    return dataById[billId];
  }, [billId]);

  const notFound = !bill;
  const summaryHighlight = bill ? stripSquareBrackets(bill.summaryHighlight) : "";

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
        {notFound ? (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">법률안을 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-8">요청하신 법률안이 존재하지 않거나 잘못된 경로입니다.</p>
          </>
        ) : (
          <>
            <div className="max-w-[960px] mx-auto text-left mb-20">
                <div className="inline-flex items-center gap-3 mb-3">
                    <p className="text-xs border border-gray-100 bg-gray-100 rounded-full px-2 py-[3px] font-semibold">{bill.tag}</p>
                    <p className="text-xs border border-gray-200 rounded-full px-3 py-[3px] font-semibold">{bill.stage}</p>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-7">{bill.billName}</h1>
                <div className="flex justify-between gap-3 mb-8">
                    <div className="inline-flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-500">{bill.proposeDate}</p>
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-500">{bill.proposer}</p>
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-500">{bill.totalCount}명 참여</p>
                    </div>
                     <div className="inline-flex items-center gap-2">
                         <Target className="w-4 h-4 text-gray-500" />
                         <p className="text-sm text-gray-500">{summaryHighlight}</p>
                    </div>
                </div>
                <div className="h-px bg-gray-200 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-8"></div>

                <div className="px-5 py-5 border border-gray-200 rounded-xl bg-white mb-6">
                    <h1 className="text-[22px] font-bold text-gray-800 mb-2">제안 배경</h1>
                    <ul className="list-disc pl-5 text-gray-500 space-y-1">
                    {parseMaybeJsonArray(bill.summaryBackground).map((line, idx) => (
                        <li key={idx}>{line}</li>
                    ))}
                    </ul>
                </div>

                <div className="px-5 py-5 border border-gray-200 rounded-xl bg-white mb-6">
                    <h1 className="text-[22px] font-bold text-gray-800 mb-2">주요 내용</h1>
                    <ul className="list-disc pl-5 text-gray-500 space-y-1">
                    {parseMaybeJsonArray(bill.summaryContent).map((line, idx) => (
                        <li key={idx}>{line}</li>
                    ))}
                    </ul>
                </div>

                <div className="px-5 py-5 border border-gray-200 rounded-xl bg-white mb-6">
                    <h1 className="text-[22px] font-bold text-gray-800 mb-2">기대 효과</h1>
                    <ul className="list-disc pl-5 text-gray-500 space-y-1">
                    {parseMaybeJsonArray(bill.summaryEffect).map((line, idx) => (
                        <li key={idx}>{line}</li>
                    ))}
                    </ul>
                </div>

                <div className="px-5 py-5 border border-gray-200 rounded-xl bg-white mb-6">
                    <h1 className="text-[22px] font-bold text-gray-800 mb-2">한 줄 요약</h1>
                    <p className="list-disc pl-5 text-gray-500 space-y-1">{bill.summaryLine}</p>
                </div>

            </div>            


            <div className="max-w-[960px] mx-auto text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{bill.billName}</h1>
                <p className="text-gray-600 mb-6">{bill.summaryLine}</p>

                <div className="max-w-[960px] mx-auto text-left">
                <div className="bg-white shadow rounded-lg p-6 border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="text-sm text-gray-500">제안일자</div>
                        <div className="text-gray-800">{bill.proposeDate}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">발의자</div>
                        <div className="text-gray-800">{bill.proposerKind} · {bill.proposer}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">단계</div>
                        <div className="text-gray-800">{bill.stage}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">분야</div>
                        <div className="text-gray-800">{bill.tag}</div>
                    </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border border-gray-100 mb-6">
                    <div className="text-sm text-gray-500 mb-2">핵심 요약</div>
                <div className="text-gray-800 font-medium">{summaryHighlight}</div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border border-gray-100 mb-6">
                    <div className="text-sm text-gray-500 mb-3">배경</div>
                    <ul className="list-disc pl-5 text-gray-800 space-y-1">
                    {parseMaybeJsonArray(bill.summaryBackground).map((line, idx) => (
                        <li key={idx}>{line}</li>
                    ))}
                    </ul>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border border-gray-100 mb-6">
                    <div className="text-sm text-gray-500 mb-3">주요 내용</div>
                    <ul className="list-disc pl-5 text-gray-800 space-y-1">
                    {parseMaybeJsonArray(bill.summaryContent).map((line, idx) => (
                        <li key={idx}>{line}</li>
                    ))}
                    </ul>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
                    <div className="text-sm text-gray-500 mb-3">영향</div>
                    <ul className="list-disc pl-5 text-gray-800 space-y-1">
                    {parseMaybeJsonArray(bill.summaryEffect).map((line, idx) => (
                        <li key={idx}>{line}</li>
                    ))}
                    </ul>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                    <div className="text-sm text-gray-500">찬성</div>
                    <div className="text-xl font-semibold text-green-600">{bill.agreeCount}</div>
                    </div>
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                    <div className="text-sm text-gray-500">반대</div>
                    <div className="text-xl font-semibold text-red-600">{bill.disagreeCount}</div>
                    </div>
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                    <div className="text-sm text-gray-500">총 참여</div>
                    <div className="text-xl font-semibold text-gray-800">{bill.totalCount}</div>
                    </div>
                </div>
                </div>
            </div>
          </>
        )}
        </div>
      </div>
      <div className="bg-gray-50 p-8">
        <Chatbot />
      </div>
    </>
  );
};

export default BillDetailPage;


