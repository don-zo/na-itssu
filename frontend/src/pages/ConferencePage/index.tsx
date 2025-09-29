import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import AssemblySummaryCardList from "@/pages/ConferencePage/components/AssemblySummaryCardList";
import { meetingsService } from "@/apis/services/meetings";
import type { Meeting } from "@/apis/types/meetings";
import type { ConferenceData } from "@/mockdata/conferences";

export const ConferencePage = () => {
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [meetings, setMeetings] = useState<ConferenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Meeting 타입을 ConferenceData 타입으로 변환하는 함수
  const convertMeetingToConferenceData = (meeting: Meeting): ConferenceData => {
    return {
      id: meeting.id,
      title: meeting.title,
      date: meeting.conf_date,
      summary: meeting.summary,
      discussion_items: meeting.discussion_items,
      pdf_link_url: meeting.pdf_link_url,
      vod_link_url: meeting.vod_link_url,
    };
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await meetingsService.getMeetings({ size: 20 });
        const convertedMeetings = response.meetings.map(convertMeetingToConferenceData);
        setMeetings(convertedMeetings);
        setError(null);
      } catch (err) {
        console.error("회의 데이터 로딩 실패:", err);
        setError("회의 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = meetings.slice(startIndex, endIndex);
  const totalPages = Math.ceil(meetings.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center container mx-auto px-4 py-8 mt-20">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">회의 데이터를 불러오는 중...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="text-center container mx-auto px-4 py-8 mt-20">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </>
    );
  }

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
            <h2 className="text-blue-600 font-bold text-2xl">{meetings.length}회</h2>
            <p className="text-gray-400 text-xs">총 회의</p>
          </div>
          <div className="w-54 h-25 border border-gray-100 rounded-lg shadow-sm flex flex-col justify-center items-center p-4">
            <h2 className="text-blue-600 font-bold text-2xl">{meetings.reduce((acc, meeting) => acc + meeting.discussion_items.length, 0)}건</h2>
            <p className="text-gray-400 text-xs">논의된 안건</p>
          </div>
          <div className="w-54 h-25 border border-gray-100 rounded-lg shadow-sm flex flex-col justify-center items-center p-4">
            <h2 className="text-blue-600 font-bold text-2xl">156명</h2>
            <p className="text-gray-400 text-xs">참석의원</p>
          </div>
          <div className="w-54 h-25 border border-gray-100 rounded-lg shadow-sm flex flex-col justify-center items-center p-4">
            <h2 className="text-blue-600 font-bold text-2xl">{meetings.length * 2}시간</h2>
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
