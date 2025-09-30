import BillCard from "@/components/BillCard";
import { useBills, useBillsByVotes, useBillSearch } from "@/apis/hooks/useBills";
import type { SortType } from "@/pages/BillPage/components/FilterButtons";
import type { BillTopVotesItem } from "@/apis/types/bills";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billsService } from "@/apis/services/bills";

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
  const queryClient = useQueryClient();

  // API 파라미터 구성
  const apiParams = {
    page: currentPage - 1, // API는 0부터 시작
    size: itemsPerPage,
  };

  // 검색어가 있으면 검색 API 사용
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    error: errorSearch,
  } = useBillSearch(searchQuery || undefined, apiParams.page);

  // 정렬 타입에 따른 일반/투표순 목록 호출 (검색어 없을 때만)
  const { data: billsDataLatest, isLoading: isLoadingLatest, error: errorLatest } = useBills(
    !searchQuery && sortType === "latest" ? { ...apiParams, sort: "proposeDate,desc" } : undefined
  );
  const { data: billsDataByVotes, isLoading: isLoadingVotes, error: errorVotes } = useBillsByVotes(
    !searchQuery && sortType === "votes" ? apiParams : undefined
  );

  const billsData = searchQuery
    ? searchData
    : sortType === "latest"
    ? billsDataLatest
    : billsDataByVotes;

  const isLoading = searchQuery
    ? isLoadingSearch
    : sortType === "latest"
    ? isLoadingLatest
    : isLoadingVotes;

  const error = searchQuery
    ? errorSearch
    : sortType === "latest"
    ? errorLatest
    : errorVotes;

  // 찬성/반대 투표 mutation
  const { mutate: voteAgreeMutate } = useMutation({
    mutationFn: (id: number) => billsService.voteAgree(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bills"] });
      await queryClient.invalidateQueries({ queryKey: ["billsByVotes"] });
      await queryClient.invalidateQueries({ queryKey: ["billsSearch"] });
    },
  });

  const { mutate: voteDisagreeMutate } = useMutation({
    mutationFn: (id: number) => billsService.voteDisagree(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bills"] });
      await queryClient.invalidateQueries({ queryKey: ["billsByVotes"] });
      await queryClient.invalidateQueries({ queryKey: ["billsSearch"] });
    },
  });

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
          {(billsData?.content as BillTopVotesItem[] | undefined)?.map((bill: BillTopVotesItem) => {
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
                id={bill.id}
                category={bill.tag}
                title={bill.billName}
                date={bill.proposeDate}
                description={bill.summaryLine}
                participants={totalVotes}
                agreeRate={agreeRate}
                disagreeRate={disagreeRate}
                width="360px"
                onAgreeClick={() => voteAgreeMutate(bill.id)}
                onDisagreeClick={() => voteDisagreeMutate(bill.id)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BillCardList;
