export type TagType =
  | "all"
  | "transport"
  | "housing"
  | "economy"
  | "environment"
  | "employment"
  | "other";

interface TagButtonsProps {
  onTagChange: (tag: TagType) => void;
  currentTag: TagType;
}

const TAGS: { key: TagType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "transport", label: "교통" },
  { key: "housing", label: "주거" },
  { key: "economy", label: "경제" },
  { key: "environment", label: "환경" },
  { key: "employment", label: "고용" },
  { key: "other", label: "기타" },
];

export const TagButtons = ({ onTagChange, currentTag }: TagButtonsProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TAGS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTagChange(key)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
            currentTag === key
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TagButtons;


