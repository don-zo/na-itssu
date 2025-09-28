import { useState } from "react";
import BillCard from "@/components/BillCard";
import Pagination from "@/components/Pagination";
import { sampleBills } from "@/mockdata/bills";

export const BillCardList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(sampleBills.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = sampleBills.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {/* 카드 그리드 */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
          {currentBills.map((bill) => (
            <BillCard
              key={bill.id}
              category={bill.status}
              title={bill.title}
              date={bill.date}
              description={bill.summary}
              participants={Math.floor(Math.random() * 1000) + 100}
              agreeRate={Math.floor(Math.random() * 40) + 30}
              disagreeRate={Math.floor(Math.random() * 40) + 30}
            />
          ))}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default BillCardList;
