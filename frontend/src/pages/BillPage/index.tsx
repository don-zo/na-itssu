import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { sampleBills } from "@/mockdata/bills";
import BillCardList from "@/pages/BillPage/components/BillCardList";
import Pagination from "@/components/Pagination";
import SearchBar from "@/pages/BillPage/components/SearchBar";

export const BillPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 9;

  // 검색어에 따른 필터링된 법률안 목록
  const filteredBills = useMemo(() => {
    if (!searchQuery) return sampleBills;
    
    return sampleBills.filter(
      (bill) =>
        bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const hasSearchResults = filteredBills.length > 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
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
            <BillCardList 
              currentPage={currentPage} 
              itemsPerPage={itemsPerPage} 
              searchQuery={searchQuery}
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
