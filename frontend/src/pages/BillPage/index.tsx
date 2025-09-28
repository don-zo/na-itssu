import { useState } from "react";
import Header from "@/components/Header";
import { sampleBills } from "@/mockdata/bills";
import BillCardList from "@/pages/BillPage/components/BillCardList";
import Pagination from "@/components/Pagination";

export const BillPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(sampleBills.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Header />
      <div className="text-center container mx-auto px-4 py-8 mt-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">법률안 목록</h1>
        <p className="text-gray-600 mb-8">
          현재 논의 중인 모든 법률안을 확인하고 투표에 참여하세요
        </p>
        <BillCardList currentPage={currentPage} itemsPerPage={itemsPerPage} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default BillPage;
