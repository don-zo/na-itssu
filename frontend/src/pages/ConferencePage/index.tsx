import { useState } from "react";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import AssemblySummaryCardList from "@/pages/ConferencePage/components/AssemblySummaryCardList";
import { mockConferenceData } from "@/mockdata/conferences";

export const ConferencePage = () => {
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = mockConferenceData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(mockConferenceData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Header />
      <div className="text-center container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          국회 회의 요약
        </h1>
        <p className="text-gray-600">
          AI가 분석한 국회 회의 내용을 간편하게 확인하세요.
          <br /> 주요 논의사항과 결정사항을 한눈에 파악할 수 있습니다.
        </p>
        <div className="flex flex-row gap-10 justify-center items-center m-8">
          <div className="w-54 h-25 border border-gray-100 rounded-lg shadow-sm flex flex-col justify-center items-center p-4">
            <h2 className="text-blue-600 font-bold text-2xl">12회</h2>
            <p className="text-gray-400 text-xs">이번주 회의</p>
          </div>
          <div className="w-54 h-25 border border-gray-100 rounded-lg shadow-sm flex flex-col justify-center items-center p-4">
            <h2 className="text-blue-600 font-bold text-2xl">48건</h2>
            <p className="text-gray-400 text-xs">논의된 안건</p>
          </div>
          <div className="w-54 h-25 border border-gray-100 rounded-lg shadow-sm flex flex-col justify-center items-center p-4">
            <h2 className="text-blue-600 font-bold text-2xl">156명</h2>
            <p className="text-gray-400 text-xs">참석의원</p>
          </div>
          <div className="w-54 h-25 border border-gray-100 rounded-lg shadow-sm flex flex-col justify-center items-center p-4">
            <h2 className="text-blue-600 font-bold text-2xl">19시간</h2>
            <p className="text-gray-400 text-xs">총 회의시간</p>
          </div>
        </div>
        <div className="border-t border-gray-100"></div>
      </div>
      <div className="mb-10">
        <AssemblySummaryCardList currentItems={currentItems} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default ConferencePage;
