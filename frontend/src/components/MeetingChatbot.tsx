import { useState } from "react";
import { MessageCircleMore } from "lucide-react";

interface MeetingChatbotProps {
  onAskAboutMeeting: () => void;
}

export const MeetingChatbot = ({ onAskAboutMeeting }: MeetingChatbotProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={onAskAboutMeeting}
        className="bg-green-500 hover:bg-green-700 text-white p-4 rounded-full shadow-lg focus:outline-none transition-all duration-200 cursor-pointer"
      >
        <MessageCircleMore />
      </button>
    </div>
  );
}; 