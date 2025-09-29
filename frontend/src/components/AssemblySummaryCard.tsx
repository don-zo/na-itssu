import { useState } from "react";
import { CalendarDays, Clock, FileText, Play, Download } from "lucide-react";

interface AgendaItem {
    id: number;
    text: string;
}

interface DecisionItem {
    id: number;
    text: string;
}

export interface AssemblySummaryCardProps {
    title: string;
    date: string;
    duration: string;
    agenda: AgendaItem[];
    summary: string;
}

const AssemblySummaryCard: React.FC<AssemblySummaryCardProps> = ({
    title,
    date,
    duration,
    agenda,
    summary,
}) => {
    return (
        <div className="w-[1000px] rounded-xl border border-gray-200 bg-white shadow-xs p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <div className="flex items-center text-gray-500 mt-2 space-x-4 text-sm">
                        <span className="flex items-center">
                        <CalendarDays size={16} className="mr-1" />
                        {date}
                        </span>
                        <span className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {duration}
                        </span>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        className="flex items-center rounded-lg border border-gray-200 px-4 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-100"
                    >
                        <Play size={16} className="mr-2" />
                        영상 보기
                    </button>
                    <button
                        className="flex items-center rounded-lg border border-gray-200 px-4 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-100"
                    >
                        <Download size={16} className="mr-2" />
                        전문 다운로드
                    </button>
                </div>
            </div>
    
            <hr className="w-full border-t border-gray-300 my-6" />

            <div className="flex flex-col md:flex-row gap-6 ml-2 mr-2">
                <div className="flex-1">
                    <h3 className="flex items-center font-semibold mb-3">
                        주요 논의사항
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
                        {agenda.map((item) => (
                            <li key={item.id} className="flex items-start">
                                <span className="w-2 h-2 mt-1.5 mr-2 rounded-full bg-blue-500"></span>
                                <span className="text-gray-500">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex-1 bg-blue-50 rounded-lg p-4">
                    <h3 className="flex font-semibold mb-2">
                        <FileText size={16} className="mr-2 mt-1" /> AI 요약
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">{summary}</p>
                </div>
            </div>
        </div>
      );
}

export default AssemblySummaryCard;
