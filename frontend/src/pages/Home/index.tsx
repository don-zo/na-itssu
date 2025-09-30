import AssemblySummaryCard from "@/components/AssemblySummaryCard";
import BillCard from "@/components/BillCard";
import Header from "@/components/Header";
import Chatbot from "@/components/chatbot";
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, ArrowRight } from "lucide-react";
import { ROUTES } from "@/routes/path";
import { useQuery } from "@tanstack/react-query";
import { billsService } from "@/apis";
import { useLatestMeeting } from "@/apis/hooks/useMeetings";

export const Home = () => {
  const navigate = useNavigate();
  const { data: topBills, isLoading, isError } = useQuery({
    queryKey: ["bills", "top", 4],
    queryFn: () => billsService.getTopNByVotes(4),
  });

  const { data: latestMeeting, isLoading: isMeetingLoading, isError: isMeetingError } = useLatestMeeting();

  function handleClick() {
    navigate(ROUTES.BILLS.DEFAULT)
  }

  function handleConferenceClick() {
    navigate(ROUTES.CONFERENCE.DEFAULT)
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 flex justify-center">
        <section
          className="w-full py-16"
          style={{
            background:
              "linear-gradient(to bottom right,#2563EB 60%, #bfdbfe 100%)",
          }}
        >
          <div className="max-w-5xl mx-auto items-center text-white text-center">
            <h1 className="text-[48px] font-bold leading-none mt-15 mb-4">
              시민의 목소리가 만드는
              <br />더 나은 대한민국
            </h1>
            <p className="text-[20px] pt-1 text-gray-300">
              법률안에 대한 시민들의 의견을 모아 민주주의를 더욱 활성화합니다
            </p>
            <div className="mt-7 flex justify-center">
              <div className="bg-white/10 p-6 rounded-xl shadow-lg w-[700px] flex-col flex items-center justify-center gap-2">
                <div className="flex items-center mb-2">
                  <TrendingUp className="text-orange-400 h-6 w-6 mr-2" />
                  <span className="inline-flex px-3 py-1 bg-orange-400 rounded-full text-sm font-medium">
                    🔥 HOT
                  </span>
                </div>
                {isLoading && (
                  <span className="text-white/80">불러오는 중...</span>
                )}
                {isError && (
                  <span className="text-red-100">데이터를 불러오지 못했습니다.</span>
                )}
                {!isLoading && !isError && topBills && topBills.length > 0 && (
                  (() => {
                    const firstBill = topBills[0];
                    const total = firstBill.totalCount ?? (firstBill.agreeCount + firstBill.disagreeCount);
                    const agreeRate = total > 0 ? (firstBill.agreeCount / total) * 100 : 0;
                    const disagreeRate = total > 0 ? (firstBill.disagreeCount / total) * 100 : 0;
                    return (
                      <BillCard
                        id={firstBill.id}
                        category={firstBill.tag || "기타"}
                        title={firstBill.billName}
                        date={firstBill.proposeDate.replaceAll("-", ".")}
                        description={firstBill.summaryLine || firstBill.summaryContent || ""}
                        participants={total}
                        agreeRate={agreeRate}
                        disagreeRate={disagreeRate}
                        width="630px"
                        isHot={true}
                        initialHasVoted={firstBill.hasVoted}
                      />
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="flex flex-col items-center justify-center mt-15">
        <div className="flex justify-center items-center">
          <Clock className="text-blue-600 h-6 w-6 mr-2" />
          <span className="inline-flex px-3 py-1 bg-blue-600 text-white rounded-full text-[15px] font-medium">
            최근 국회
          </span>
        </div>
        <h1 className="text-[30px] font-bold mt-3">최신 국회 회의 요약</h1>
        <span className="text-[17px] text-gray-500 mt-1 mb-8">
          AI가 분석한 최신 국회 활동을 확인해보세요!
        </span>
        {isMeetingLoading && (
          <div className="text-center">
            <span className="text-gray-500">회의 정보를 불러오는 중...</span>
          </div>
        )}
        {isMeetingError && (
          <div className="text-center">
            <span className="text-red-500">회의 정보를 불러오지 못했습니다.</span>
          </div>
        )}
        {!isMeetingLoading && !isMeetingError && latestMeeting && (
          <AssemblySummaryCard
            title={latestMeeting.title}
            date={latestMeeting.conf_date.replaceAll("-", ".")}
            summary={latestMeeting.summary}
            discussion_items={latestMeeting.discussion_items}
            buttonText="더 많은 회의요약 보기"
            onButtonClick={handleConferenceClick}
            showChatButton={true}
          />
        )}
        {!isMeetingLoading && !isMeetingError && !latestMeeting && (
          <div className="text-center">
            <span className="text-gray-500">최신 회의 정보가 없습니다.</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center mt-15">
        <div className="flex justify-center items-center">
          <TrendingUp className="text-blue-600 h-6 w-6 mr-2" />
          <span className="inline-flex px-3 py-1 bg-gray-100 rounded-full text-[15px] font-medium">
            실시간 인기
          </span>
        </div>
        <h1 className="text-[30px] font-bold mt-3">투표율이 높은 법률안</h1>
        <span className="text-[17px] text-gray-500 mt-1 mb-8">시민들의 관심이 많은 법률안에 참여해보세요!</span>
        <TopBillsSection topBills={topBills} isLoading={isLoading} isError={isError} />
      </div>
      <div className="flex justify-center mt-8 mb-15">
        <button onClick={handleClick}
            className="flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-100"
        >
            모든 법률안 보기
            <ArrowRight className="h-4 w-4 ml-3 text-gray-700" />
        </button>
      </div>
      <Chatbot />
    </>
  );
};

export default Home;

function TopBillsSection({ topBills, isLoading, isError }: { topBills: any[] | undefined, isLoading: boolean, isError: boolean }) {
  // 첫 번째 카드는 HOT 섹션에서 사용하므로 나머지 3개만 사용
  const remainingBills = topBills ? topBills.slice(1, 4) : [];

  // 무한 루프를 위해 동일한 배열을 세 번 이어 붙임
  const marqueeItems = [...remainingBills, ...remainingBills, ...remainingBills];

  return (
    <>
      {isLoading && (
        <span className="text-white/80">불러오는 중...</span>
      )}
      {isError && (
        <span className="text-red-100">데이터를 불러오지 못했습니다.</span>
      )}
      {!isLoading && !isError && remainingBills && remainingBills.length > 0 && (
        <div className="marquee-container">
          <div className="marquee-track">
            {marqueeItems.map((item: any, index: number) => {
              const total = item.totalCount ?? (item.agreeCount + item.disagreeCount);
              const agreeRate = total > 0 ? (item.agreeCount / total) * 100 : 0;
              const disagreeRate = total > 0 ? (item.disagreeCount / total) * 100 : 0;
              const key = `${item.id}-${index}`;
              return (
                <BillCard
                  key={key}
                  id={item.id}
                  category={item.tag || "기타"}
                  title={item.billName}
                  date={item.proposeDate.replaceAll("-", ".")}
                  description={item.summaryLine || item.summaryContent || ""}
                  participants={total}
                  agreeRate={agreeRate}
                  disagreeRate={disagreeRate}
                  width="360px"
                  initialHasVoted={item.hasVoted}
                />
              );
            })}
          </div>
          <div className="marquee-fade-left" />
          <div className="marquee-fade-right" />
        </div>
      )}
    </>
  );
}
