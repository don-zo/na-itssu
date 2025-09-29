import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { sampleBills } from "@/mockdata/bills";
import BillCardList from "@/pages/BillPage/components/BillCardList";
import Pagination from "@/components/Pagination";
import SearchBar from "@/pages/BillPage/components/SearchBar";
import FilterButtons from "@/pages/BillPage/components/FilterButtons";
import type { SortType } from "@/pages/BillPage/components/FilterButtons";

export const BillPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("latest");
  const itemsPerPage = 9;

  // 검색어에 따른 필터링된 법률안 목록
  const filteredBills = useMemo(() => {
    let bills = sampleBills;

    // 검색 필터링
    if (searchQuery) {
      bills = bills.filter(
        (bill) =>
          bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 정렬 로직
    const sortedBills = [...bills].sort((a, b) => {
      switch (sortType) {
        case "latest":
          // 날짜 기준 내림차순 (최신순)
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "votes":
          // 투표 참여자 수 기준 내림차순 (투표순)
          return b.id - a.id;
        default:
          return 0;
      }
    });

    return sortedBills;
  }, [searchQuery, sortType]);

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const hasSearchResults = filteredBills.length > 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortType: SortType) => {
    setSortType(newSortType);
    setCurrentPage(1);
  };

  return (
    <>
      <Header />
      <div className="text-center container mx-auto px-4 py-8 mt-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">법률안 목록</h1>
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
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              searchQuery={searchQuery}
              sortType={sortType}
            />
            <Pagination
              currentPage={currentPage}
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
    </>
  );
};

export default BillPage;
