import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { chatbotService } from "@/apis/services/chatbot";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface BillChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  billId: number;
  billName: string;
}

export const BillChatbot = ({ isOpen, onClose, billId, billName }: BillChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `안녕하세요! "${billName}" 법률안에 대해 무엇이든 질문해주세요.`,
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
          billId: billId,
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

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 top-24 z-50 w-80 h-[600px] bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">AI에게 질문하기</h2>
        <button
          onClick={onClose}
          className="text-gray-400 rounded-full p-1 hover:bg-gray-200 focus:outline-none"
        >
          <X className="w-5 h-5" />
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
  );
};
