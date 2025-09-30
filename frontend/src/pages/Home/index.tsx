import AssemblySummaryCard from "@/components/AssemblySummaryCard";
import BillCard from "@/components/BillCard";
import Header from "@/components/Header";
import Chatbot from "@/components/chatbot";
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, ArrowRight } from "lucide-react";
import { ROUTES } from "@/routes/path";
import { useQuery } from "@tanstack/react-query";
import { billsService } from "@/apis";

export const Home = () => {
  const navigate = useNavigate();

  function handleClick() {
    navigate(ROUTES.BILLS.DEFAULT)
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
                <BillCard
                  category="환경"
                  title="탄소 중립 기본법"
                  date="2025.09.01"
                  description="2050 탄소중립 달성을 위한 기업 탄소배출 의무신고제, 친환경 에너지 전환 지원, 일회용품 사용 제한 강화 등 환경보호를 위한 종합 법안입니다."
                  participants={19250}
                  agreeRate={70.2}
                  disagreeRate={29.8}
                  width="630px"
                  isHot={true}
                />
              </div>
            </div>
          </div>
        </section>

        <Chatbot />
      </div>
      <div className="flex flex-col items-center justify-center mt-15">
        <div className="flex justify-center items-center">
          <Clock className="text-blue-600 h-6 w-6 mr-2" />
          <span className="inline-flex px-3 py-1 bg-blue-600 text-white rounded-full text-[15px] font-medium">
            오늘의 국회
          </span>
        </div>
        <h1 className="text-[30px] font-bold mt-3">오늘자 국회 회의 요약</h1>
        <span className="text-[17px] text-gray-500 mt-1 mb-8">
          AI가 분석한 오늘의 국회 활동을 확인해보세요!
        </span>
        <AssemblySummaryCard
          title="제21대 국회 제3차 본회의"
          date="2025.09.20"
          summary="이번 본회의에서는 기후 변화 대응을 위한 탄소중립 기본법 개정안이 찬성 다수로 가결되었으며, 청년 주거 안정 지원책을 위한 예산 증액안 또한 통과되었습니다. 또한 미래 사회 대비를 위해 디지털 교육 인프라 구축을 전담할 특별위원회를 신설하기로 결정했습니다. 전반적으로 기후·청년·디지털을 중심으로 하는 사회적 의제가 강조된 회의였습니다."
          discussion_items={[
            "탄소중립 기본법 개정안 논의",
            "청년 주거 지원 정책 보고",
            "디지털 전환을 위한 교육 인프라 확대",
          ]}
        />
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
        <TopBillsSection />
      </div>
      <div className="flex justify-center mt-8 mb-15">
        <button onClick={handleClick}
            className="flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-100"
        >
            모든 법률안 보기
            <ArrowRight className="h-4 w-4 ml-3 text-gray-700" />
        </button>
      </div>
    </>
  );
};

export default Home;

function TopBillsSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bills", "top", 3],
    queryFn: () => billsService.getTopNByVotes(3),
  });
  
  return (
    <>
      {isLoading && (
        <span className="text-white/80">불러오는 중...</span>
      )}
      {isError && (
        <span className="text-red-100">데이터를 불러오지 못했습니다.</span>
      )}
      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex gap-4 w-full justify-center items-center">
          {data.map((item: any) => {
            const total = item.totalCount ?? (item.agreeCount + item.disagreeCount);
            const agreeRate = total > 0 ? (item.agreeCount / total) * 100 : 0;
            const disagreeRate = total > 0 ? (item.disagreeCount / total) * 100 : 0;
            return (
              <BillCard
                key={item.id}
                category={item.tag || "기타"}
                title={item.billName}
                date={item.proposeDate.replaceAll("-", ".")}
                description={item.summaryLine || item.summaryContent || ""}
                participants={total}
                agreeRate={agreeRate}
                disagreeRate={disagreeRate}
                width="360px"
              />
            );
          })}
        </div>
      )}
    </>
  );
}
