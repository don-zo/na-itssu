import BillCard from "@/components/BillCard";
import { useBills } from "@/apis/hooks/useBills";
import type { SortType } from "@/pages/BillPage/components/FilterButtons";
import type { BillTopVotesItem } from "@/apis/types/bills";

interface BillCardListProps {
  currentPage: number;
  itemsPerPage: number;
  searchQuery?: string;
  sortType?: SortType;
}

export const BillCardList = ({
  currentPage,
  itemsPerPage,
  searchQuery = "",
  sortType = "latest",
}: BillCardListProps) => {
  // API 파라미터 구성
  const apiParams = {
    page: currentPage - 1, // API는 0부터 시작
    size: itemsPerPage,
    sort: sortType === "latest" ? "proposeDate,desc" : "totalCount,desc",
  };

  // API 호출
  const { data: billsData, isLoading, error } = useBills(apiParams);

  // 검색어에 따른 필터링 (클라이언트 사이드)
  const filteredBills =
    billsData?.content?.filter((bill: BillTopVotesItem) => {
      if (!searchQuery) return true;
      return (
        bill.billName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.summaryLine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">법률안을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-red-500">법률안을 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px]">
          {filteredBills.map((bill: BillTopVotesItem) => {
            // 투표율 계산
            const totalVotes = bill.totalCount;
            const agreeRate =
              totalVotes > 0
                ? Math.round((bill.agreeCount / totalVotes) * 100)
                : 0;
            const disagreeRate =
              totalVotes > 0
                ? Math.round((bill.disagreeCount / totalVotes) * 100)
                : 0;

            return (
              <BillCard
                key={bill.id}
                category={bill.tag}
                title={bill.billName}
                date={bill.proposeDate}
                description={bill.summaryLine}
                participants={totalVotes}
                agreeRate={agreeRate}
                disagreeRate={disagreeRate}
                width="360px"
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BillCardList;
