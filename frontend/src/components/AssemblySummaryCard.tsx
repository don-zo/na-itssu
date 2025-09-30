import { useState, useEffect, useRef } from "react";
import { CalendarDays, FileText, Play, Download, X, Send } from "lucide-react";
import { chatbotService } from "@/apis";

export interface AssemblySummaryCardProps {
  title: string;
  date: string;
  discussion_items: string[];
  summary: string;
  pdfLinkUrl?: string;
  vodLinkUrl?: string;
  conferenceId?: number;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AssemblySummaryCard: React.FC<AssemblySummaryCardProps> = ({
  title,
  date,
  discussion_items,
  summary,
  pdfLinkUrl,
  vodLinkUrl,
  conferenceId,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "안녕하세요! 무엇을 도와드릴까요?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setMessages((prev) => {
      const userMessage: Message = {
        id: prev.length + 1,
        text: trimmed,
        isUser: true,
        timestamp: new Date(),
      };
      return [...prev, userMessage];
    });
    setInputText("");
    setIsLoading(true);

    try {
      let currentSessionId = sessionId;

      // 세션이 없으면 새로 생성
      if (!currentSessionId) {
        const session = await chatbotService.createSession();
        currentSessionId = session.sessionId;
        setSessionId(currentSessionId);
      }

      const botMessageId = messages.length + 2;
      setStreamingMessageId(botMessageId);

      setMessages((prev) => {
        const botMessage: Message = {
          id: botMessageId,
          text: "",
          isUser: false,
          timestamp: new Date(),
        };
        return [...prev, botMessage];
      });

      await chatbotService.sendMessageStream(
        {
          message: trimmed,
          sessionId: currentSessionId, // 생성된 세션 ID 사용
          billId: conferenceId,
        },
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: msg.text + chunk } : msg
            )
          );
        },
        () => {
          setStreamingMessageId(null);
          setIsLoading(false);
        },
        (error: Error) => {
          console.error("스트리밍 에러:", error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: "죄송합니다. 일시적인 오류가 발생했습니다." }
                : msg
            )
          );
          setStreamingMessageId(null);
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("챗봇 API 오류:", error);
      setMessages((prev) => {
        const errorMessage: Message = {
          id: prev.length + 1,
          text: "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.",
          isUser: false,
          timestamp: new Date(),
        };
        return [...prev, errorMessage];
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  const renderTextWithLineBreaks = (text: string) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="flex gap-4">
      <div className="w-[1000px] rounded-xl border border-gray-200 bg-white shadow-xs p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="flex items-center text-gray-500 mt-2 space-x-4 text-sm">
              <span className="flex items-center">
                <CalendarDays size={16} className="mr-1" />
                {date}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <a
              href={vodLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center rounded-lg border border-gray-200 px-4 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-100"
            >
              <Play size={16} className="mr-2" />
              영상 보기
            </a>
            <a
              href={pdfLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center rounded-lg border border-gray-200 px-4 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-100"
            >
              <Download size={16} className="mr-2" />
              전문 다운로드
            </a>
          </div>
        </div>

        <hr className="w-full border-t border-gray-300 my-6" />
        <div className="flex flex-col md:flex-row gap-6 ml-2 mr-2">
          <div className="flex-1">
            <h3 className="flex items-center font-semibold mb-3">
              주요 논의사항
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
              {discussion_items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 mt-1.5 mr-2 rounded-full bg-blue-500"></span>
                  <span className="text-gray-500">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="flex font-semibold">
              <FileText size={16} className="mr-2 mt-1" /> AI 요약
            </h3>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center rounded-lg border border-gray-200 px-4 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-100"
            >
              AI에게 물어보기
            </button>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">
              {summary}
            </p>
          </div>
        </div>
      </div>

      {/* 오른쪽 채팅창 */}
      <div
        className={`transition-all duration-200 ease-in-out overflow-hidden ${
          isChatOpen ? "w-80 opacity-100" : "w-0 opacity-0"
        }`}
      >
        {isChatOpen && (
          <div className="w-80 h-[600px] bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
            <div className="text-white p-2 rounded-t-lg flex justify-between items-center">
              <h2 className="font-semibold">{}</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 rounded-full p-1 hover:bg-gray-200 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* 메시지 영역 */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-3"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.isUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">
                      {renderTextWithLineBreaks(message.text)}
                      {streamingMessageId === message.id && (
                        <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                      )}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="회의에 대해 궁금한 점을 질문하세요."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent text-sm transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputText.trim() || isLoading}
                >
                  <Send className="w-[20px]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssemblySummaryCard;
