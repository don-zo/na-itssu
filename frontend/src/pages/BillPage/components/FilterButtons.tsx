export type SortType = "latest" | "votes";

interface FilterButtonsProps {
  onSortChange: (sortType: SortType) => void;
  currentSort: SortType;
}

export const FilterButtons = ({
  onSortChange,
  currentSort,
}: FilterButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSortChange("latest")}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
          currentSort === "latest"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        최신순
      </button>
      <button
        onClick={() => onSortChange("votes")}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
          currentSort === "votes"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        투표순
      </button>
    </div>
  );
};

export default FilterButtons;
