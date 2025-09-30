import { useState, useMemo } from "react";
import Header from "@/components/Header";
import BillCardList from "@/pages/BillPage/components/BillCardList";
import Pagination from "@/components/Pagination";
import SearchBar from "@/pages/BillPage/components/SearchBar";
import FilterButtons from "@/pages/BillPage/components/FilterButtons";
import type { SortType } from "@/pages/BillPage/components/FilterButtons";
import Chatbot from "@/components/chatbot";
import { useBills, useBillsByVotes, useBillSearch } from "@/apis/hooks/useBills";
import type { BillPageResponse } from "@/apis/types/bills";

export const BillPage = () => {
  const [currentPage, setCurrentPage] = useState(0); // API는 0부터 시작
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("latest");
  const itemsPerPage = 9;

  // 공통 페이지 파라미터
  const apiParams = useMemo(() => {
    return {
      page: currentPage,
      size: itemsPerPage,
    } as const;
  }, [currentPage]);

  // 데이터 소스들: 검색 / 최신 / 투표순
  const { data: searchData, isLoading: isLoadingSearch, error: errorSearch } = useBillSearch(
    searchQuery || undefined,
    apiParams.page
  );
  const { data: latestData, isLoading: isLoadingLatest, error: errorLatest } = useBills(
    !searchQuery && sortType === "latest"
      ? { ...apiParams, sort: "proposeDate,desc" }
      : undefined
  );
  const { data: votesData, isLoading: isLoadingVotes, error: errorVotes } = useBillsByVotes(
    !searchQuery && sortType === "votes" ? apiParams : undefined
  );

  const activeData: BillPageResponse | undefined = searchQuery
    ? searchData
    : sortType === "latest"
    ? latestData
    : votesData;

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

  const totalPages = activeData?.totalPages ?? 0;
  const hasResults = (activeData?.content?.length ?? 0) > 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // API는 0부터 시작하므로 1 빼기
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  const handleSortChange = (newSortType: SortType) => {
    setSortType(newSortType);
    setCurrentPage(0);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="text-center container mx-auto px-4 py-8 mt-20">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">법률안 목록</h1>
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">법률안을 불러오는 중...</span>
          </div>
        </div>
      </>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <>
        <Header />
        <div className="text-center container mx-auto px-4 py-8 mt-20">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">법률안 목록</h1>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-red-500 text-lg mb-4">
              법률안을 불러오는데 실패했습니다
            </div>
            <div className="text-gray-400 text-sm">
              잠시 후 다시 시도해주세요
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="text-center container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">법률안 목록</h1>
        <p className="text-gray-600 mb-8">
          현재 논의 중인 모든 법률안을 확인하고 투표에 참여하세요
        </p>

        <SearchBar onSearch={handleSearch} />

        {hasResults ? (
          <>
            <div className="relative max-w-[1120px] mx-auto mb-8">
              <div className="flex justify-end">
                <FilterButtons
                  onSortChange={handleSortChange}
                  currentSort={sortType}
                />
              </div>
              <div className="border-t border-gray-100 mt-4"></div>
            </div>

            <BillCardList
              currentPage={currentPage + 1} // 컴포넌트는 1부터 시작
              itemsPerPage={itemsPerPage}
              searchQuery={searchQuery}
              sortType={sortType}
            />
            <Pagination
              currentPage={currentPage + 1} // 컴포넌트는 1부터 시작
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-16 pb-70">
            <div className="text-gray-500 text-lg mb-4">
              검색 결과가 없습니다
            </div>
            <div className="text-gray-400 text-sm">
              다른 키워드로 검색해보세요
            </div>
          </div>
        )}
      </div>
      <div className="bg-gray-50 p-8">
        <Chatbot />
      </div>
    </>
  );
};

export default BillPage;
