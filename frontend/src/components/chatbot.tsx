import { useState, useEffect, useRef } from "react";
import { MessageCircleMore, Send } from "lucide-react";
import { chatbotService } from "@/apis";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  buttonText?: string;
  title?: string;
  placeholder?: string;
  initialMessage?: string;
  onCustomAction?: () => void;
  customButtonIcon?: React.ReactNode;
}

export const Chatbot = ({ 
  buttonText = "AI에게 물어보기",
  title = "법률안 도우미",
  placeholder = "메세지를 입력하세요.",
  initialMessage = "안녕하세요! 무엇을 도와드릴까요?",
  onCustomAction,
  customButtonIcon
}: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: initialMessage,
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

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지가 변경될 때마다 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) {
      return;
    }

    // 사용자 메시지 추가
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
      // 첫 번째 메시지이고 세션이 없으면 세션 생성
      if (!sessionId) {
        const session = await chatbotService.createSession();
        setSessionId(session.sessionId);
        console.log("새로운 세션 생성:", session.sessionId);
      }

      // 스트리밍 응답을 위한 빈 메시지 생성
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

      // 스트리밍 메시지 전송
      await chatbotService.sendMessageStream(
        {
          message: trimmed,
          sessionId: sessionId!,
        },
        // onMessage: 각 청크를 받을 때마다 호출
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: msg.text + chunk } : msg
            )
          );
        },
        // onComplete: 스트리밍 완료 시 호출
        () => {
          console.log("스트리밍 완료");
          setStreamingMessageId(null);
          setIsLoading(false);
        },
        // onError: 에러 발생 시 호출
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

  // 텍스트를 줄바꿈으로 분할하여 렌더링하는 함수
  const renderTextWithLineBreaks = (text: string) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  const handleButtonClick = () => {
    if (onCustomAction) {
      onCustomAction();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleButtonClick}
        className="bg-blue-500 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg focus:outline-none transition-all duration-200 cursor-pointer"
      >
        {customButtonIcon || <MessageCircleMore />}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-80 h-120 bg-white rounded-lg shadow-md border border-none flex flex-col">
          <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h2 className="font-semibold">{title}</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            ></button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
            {/* 자동 스크롤을 위한 더미 요소 */}
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
                placeholder={placeholder}
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
  );
};

export default Chatbot;
