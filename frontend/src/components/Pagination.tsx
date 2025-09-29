import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pagesPerGroup = 8; // 한 그룹에 보여줄 페이지 수
  const currentGroup = Math.ceil(currentPage / pagesPerGroup);
  const startPage = (currentGroup - 1) * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

  // 현재 그룹의 페이지 번호들 생성
  const getPageNumbers = () => {
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center mt-12 space-x-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-7 h-7 rounded-xl transition-colors duration-200 ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-500 hover:bg-blue-50"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-7 h-7 rounded-xl transition-colors duration-200 ${
              page === currentPage
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-7 h-7 rounded-xl transition-colors duration-200 ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-500 hover:bg-blue-50"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};

export default Pagination;
