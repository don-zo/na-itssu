import { useState, useEffect, useRef } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, X, Send } from "lucide-react";
import type { BillTopVotesItem } from "@/apis/types/bills";
import { chatbotService } from "@/apis/services/chatbot";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface VoteSectionProps {
  bill: BillTopVotesItem;
  hasVoted: boolean;
  voting: boolean;
  onVoteAgree: () => void;
  onVoteDisagree: () => void;
}

export const VoteSection = ({ 
  bill, 
  hasVoted, 
  voting, 
  onVoteAgree, 
  onVoteDisagree
}: VoteSectionProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `안녕하세요! "${bill.billName}" 법률안에 대해 무엇이든 질문해주세요.`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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
          sessionId: currentSessionId,
          billId: bill.id,
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
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "죄송합니다. 일시적인 오류가 발생했습니다.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="col-span-1">
      <div className="sticky top-24">
        <div className="px-6 py-5 border border-gray-200 rounded-xl bg-white mb-4 h-fit">
          <h1 className="text-[22px] font-bold text-gray-800 mb-1">
            시민 의견 투표
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            이 법률안에 대한 의견을 투표해주세요.
          </p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-3">
              {hasVoted ? (
                <>
                  <span className="text-blue-600">
                    찬성{" "}
                    {bill.totalCount > 0
                      ? (
                          (bill.agreeCount / bill.totalCount) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                  <span className="text-red-500">
                    반대{" "}
                    {bill.totalCount > 0
                      ? (
                          (bill.disagreeCount / bill.totalCount) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </>
              ) : (
                <span className="text-gray-500 ml-1">
                  투표 후 결과가 표시됩니다
                </span>
              )}
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full flex overflow-hidden">
              {hasVoted ? (
                <>
                  <div
                    className="bg-blue-500 h-4"
                    style={{
                      width: `${
                        (bill.agreeCount / bill.totalCount) * 100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-red-500 h-4"
                    style={{
                      width: `${
                        (bill.disagreeCount / bill.totalCount) *
                        100
                      }%`,
                    }}
                  ></div>
                </>
              ) : (
                <div className="bg-gray-300 h-4 w-full"></div>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6 text-center">
            총 {bill.totalCount.toLocaleString()}명 참여
          </p>

          <div className="border-t border-gray-200 mb-6"></div>

          <div className="mb-2 flex flex-col gap-3">
            <button
              onClick={onVoteAgree}
              disabled={voting || hasVoted}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ThumbsUp className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700 text-sm">
                {voting
                  ? "투표 중..."
                  : hasVoted
                  ? "투표 완료"
                  : "찬성합니다"}
              </span>
            </button>
            <button
              onClick={onVoteDisagree}
              disabled={voting || hasVoted}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ThumbsDown className="w-4 h-4 text-red-600" />
              <span className="font-medium text-gray-700 text-sm">
                {voting
                  ? "투표 중..."
                  : hasVoted
                  ? "투표 완료"
                  : "반대합니다"}
              </span>
            </button>
          </div>
        </div>

        <a
          href={`https://search.naver.com/search.naver?query=${encodeURIComponent(
            bill.billName
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-6 py-3 border border-gray-200 text-[17px] rounded-xl bg-white font-semibold hover:bg-gray-50 text-center inline-block mb-3"
        >
          관련 내용 검색
        </a>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-full px-6 py-3 border border-gray-200 text-[17px] rounded-xl bg-white font-semibold hover:bg-gray-50 text-center inline-flex items-center justify-center gap-2 mb-3"
        >
          <MessageCircle className="w-5 h-5" />
          AI에게 질문하기
        </button>

        {/* 채팅창 - 아래쪽에 표시 */}
        {isChatOpen && (
          <div className="w-full h-[500px] bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">AI에게 질문하기</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 rounded-full p-1 hover:bg-gray-200 focus:outline-none"
              >
                <X className="w-4 h-4" />
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
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.isUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    {streamingMessageId === message.id && (
                      <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                    )}
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
                  placeholder="메시지를 입력하세요..."
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
