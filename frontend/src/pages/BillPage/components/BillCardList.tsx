import { sampleBills } from "@/mockdata/bills";
import BillCard from "@/components/BillCard";
import Chatbot from "@/components/Chatbot";

interface BillCardListProps {
  currentPage: number;
  itemsPerPage: number;
}

export const BillCardList = ({
  currentPage,
  itemsPerPage,
}: BillCardListProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = sampleBills.slice(startIndex, endIndex);

  return (
    <>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px]">
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
      <div className="min-h-screen bg-gray-50 p-8">
        <Chatbot />
      </div>
    </>
  );
};

export default BillCardList;
