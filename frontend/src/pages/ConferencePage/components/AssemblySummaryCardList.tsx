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
            summary={item.summary}
            discussion_items={item.discussion_items}
            pdfLinkUrl={item.pdf_link_url}
            vodLinkUrl={item.vod_link_url}
            conferenceId={item.conf_id}
          />
        ))}
      </div>
    </div>
  );
};

export default AssemblySummaryCardList;
