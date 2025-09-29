import BillCard from "@/components/BillCard";
import { sampleBills } from "@/mockdata/bills";
import type { SortType } from "@/pages/BillPage/components/FilterButtons";

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
  // 검색어가 있으면 필터링, 없으면 모든 법률안
  const filteredBills = searchQuery
    ? sampleBills.filter(
        (bill) =>
          bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sampleBills;

  // 필터링 기능
  const sortedBills = [...filteredBills].sort((a, b) => {
    switch (sortType) {
      case "latest":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "votes":
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = sortedBills.slice(startIndex, endIndex);

  return (
    <>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px]">
          {currentBills.map((bill) => (
            <BillCard
              key={bill.id}
              category={bill.category}
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
    </>
  );
};

export default BillCardList;
