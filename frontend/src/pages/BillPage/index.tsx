import { useState, useMemo } from "react";
import Header from "@/components/Header";
import BillCardList from "@/pages/BillPage/components/BillCardList";
import Pagination from "@/components/Pagination";
import SearchBar from "@/pages/BillPage/components/SearchBar";
import FilterButtons from "@/pages/BillPage/components/FilterButtons";
import type { SortType } from "@/pages/BillPage/components/FilterButtons";
import Chatbot from "@/components/chatbot";
import { useBills } from "@/apis/hooks/useBills";
import type { BillTopVotesItem } from "@/apis/types/bills";

export const BillPage = () => {
  const [currentPage, setCurrentPage] = useState(0); // API는 0부터 시작
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("latest");
  const itemsPerPage = 9;

  // API 파라미터 구성
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      size: itemsPerPage,
    };

    // 정렬 파라미터 설정
    if (sortType === "latest") {
      params.sort = "proposeDate,desc";
    } else if (sortType === "votes") {
      params.sort = "totalCount,desc";
    }

    return params;
  }, [currentPage, sortType]);

  // API 호출
  const { data: billsData, isLoading, error } = useBills(apiParams);

  // 검색어에 따른 필터링 (클라이언트 사이드)
  const filteredBills = useMemo(() => {
    if (!billsData?.content) return [];

    let bills = billsData.content;

    // 검색 필터링
    if (searchQuery) {
      bills = bills.filter(
        (bill: BillTopVotesItem) =>
          bill.billName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.summaryLine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return bills;
  }, [billsData?.content, searchQuery]);

  const totalPages = billsData?.totalPages || 0;
  const hasSearchResults = filteredBills.length > 0;

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

        {hasSearchResults ? (
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
          <div className="flex flex-col items-center justify-center py-16">
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
