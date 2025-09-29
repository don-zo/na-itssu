import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Chatbot from "@/components/Chatbot";
import { ROUTES } from "@/routes/path";
import { ArrowLeft, Calendar, Building2, Users, Target, Clock, ThumbsUp, ThumbsDown } from "lucide-react";

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
    "summaryContent": "[\"세금 감면 대상 확대\",\"감면 기준 및 절차 강화\",\"지방세 체납자에 대한 제재 강화\"]",
    "proposerKind": "의원",
    "proposer": "채현일의원 등 11인",
    "summaryBackground": "현행 지방세특례제한법은 특정 대상에 대한 지방세 감면 규정을 두고 있으나, 일부 사각지대와 문제점이 제기됨. 이에 부족한 부분을 보완하고, 공정한 세금 부과를 위한 개선이 필요함.",
    "disagreeCount": 231,
    "totalCount": 2543,
    "billName": "지방세특례제한법 일부개정법률안",
    "summaryHighlight": "[세금 감면 대상 확대, 감면 기준 강화, 체납자 제재 강화]",
    "stage": "접수(발의)",
    "summaryEffect": "[\"공정한 세금 부과 체계 확립\",\"취약계층 지원 확대\",\"세수 확충을 통한 지역 발전 투자\"]",
    "agreeCount": 2312,
    "summaryLine": "지방세 특례 확대를 통한 공정한 세금 부과 및 지역 발전",
    "id": 1,
    "tag": "기타",
    "billNo": 2213340,
    "proposeDate": "2025-09-26"
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
          {notFound ? (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                법률안을 찾을 수 없습니다
              </h1>
              <p className="text-gray-600 mb-8">
                요청하신 법률안이 존재하지 않거나 잘못된 경로입니다.
              </p>
            </>
          ) : (
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
                            <h1 className="text-[22px] font-bold text-gray-800 mb-2">한 줄 요약</h1>
                            <p className="list-disc text-gray-600 space-y-1">{bill.summaryLine}</p>
                        </div>

                        <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6">
                            <h1 className="text-[22px] font-bold text-gray-800 mb-2">제안 배경</h1>
                            <p className="list-disc text-gray-600 space-y-1">{bill.summaryBackground}</p>
                        </div>

                        <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6">
                            <h1 className="text-[22px] font-bold text-gray-800 mb-2">주요 내용</h1>
                            <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
                            {parseMaybeJsonArray(bill.summaryContent).map((line, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="w-2 h-2 mt-1.5 mr-2 rounded-full bg-blue-500"></span>
                                    <span className="text-gray-600">{line}</span>
                                </li>
                            ))}
                            </ul>
                        </div>
                        

                        <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6">
                            <h1 className="text-[22px] font-bold text-gray-800 mb-2">기대 효과</h1>
                            <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
                            {parseMaybeJsonArray(bill.summaryEffect).map((line, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="w-2 h-2 mt-1.5 mr-2 rounded-full bg-blue-500"></span>
                                    <span className="text-gray-600">{line}</span>
                                </li>
                            ))}
                            </ul>
                        </div>
                        

                        <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6">
                            <div className="inline-flex items-center gap-2 mb-3">
                                <Clock className="w-6 h-6" />
                                <h1 className="text-[22px] font-bold text-gray-800">진행 단계</h1>
                            </div>
                            <ul className="space-y-2 ml-[6px]">
                                {["접수(발의)", "소관위 심사 중", "소관위 의결", "본회의 부의", "본회의 의결", "처리 완료"].map((stage, idx) => (
                                    <li key={idx} className={`flex items-center gap-3 ${idx !== 5 ? 'mb-3' : ''}`}>
                                        <span className={`w-[12px] h-[12px] mr-2 rounded-full ${
                                            bill.stage === stage ? 'bg-blue-500' : 'bg-gray-100'
                                        }`}></span>
                                        <span className={`text-[15px] ${
                                            bill.stage === stage ? 'text-blue-600 font-medium' : 'text-gray-500'
                                        }`}>
                                            {stage}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="col-span-1 px-6 py-5 border border-gray-200 rounded-xl bg-white mb-6 sticky top-24 h-fit">
                        <h1 className="text-[22px] font-bold text-gray-800 mb-1">시민 의견 투표</h1>
                        <p className="text-sm text-gray-500 mb-4">이 법률안에 대한 의견을 투표해주세요.</p>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-blue-600">찬성 {((bill.agreeCount / bill.totalCount) * 100).toFixed(1)}%</span>
                                <span className="text-red-500">반대 {((bill.disagreeCount / bill.totalCount) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-4 bg-gray-200 rounded-full flex overflow-hidden">
                                <div
                                    className="bg-blue-500 h-4"
                                    style={{ width: `${(bill.agreeCount / bill.totalCount) * 100}%` }}
                                ></div>
                                <div
                                    className="bg-red-500 h-4"
                                    style={{ width: `${(bill.disagreeCount / bill.totalCount) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-6 text-center">총 {bill.totalCount.toLocaleString()}명 참여</p>

                        <div className="border-t border-gray-200 mb-6"></div>

                        <div className="mb-4 flex flex-col gap-3">
                            <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                                <ThumbsUp className="w-4 h-4 text-gray-700" />
                                <span className="font-medium text-gray-700 text-sm">찬성합니다</span>
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                                <ThumbsDown className="w-4 h-4 text-gray-700" />
                                <span className="font-medium text-gray-700 text-sm">반대합니다</span>
                            </button>
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
