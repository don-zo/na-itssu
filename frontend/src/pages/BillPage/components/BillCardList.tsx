import BillCard from "@/components/BillCard";
import { sampleBills } from "@/mockdata/bills";

export const BillCardList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sampleBills.map((bill) => (
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
  );
};

export default BillCardList;
