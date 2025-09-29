import AssemblySummaryCard from "@/components/AssemblySummaryCard";
import type { ConferenceData } from "@/mockdata/conferences";

interface AssemblySummaryCardListProps {
  currentItems: ConferenceData[];
}

export const AssemblySummaryCardList = ({
  currentItems,
}: AssemblySummaryCardListProps) => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4">
        {currentItems.map((item) => (
          <AssemblySummaryCard
            key={item.id}
            title={item.title}
            date={item.date}
            duration={item.duration}
            summary={item.summary}
            agenda={item.agenda}
            decision={item.decision}
          />
        ))}
      </div>
    </div>
  );
};

export default AssemblySummaryCardList;
