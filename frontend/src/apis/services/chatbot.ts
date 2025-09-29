import { chatbotClient } from "@/apis/client/apiClients";
import { CHATBOT_ENDPOINTS } from "@/apis/constants/endpoint";
import type { CreateSessionResponse, ChatMessage } from "@/apis/types/chatbot";

export const chatbotService = {
  createSession: async (): Promise<CreateSessionResponse> => {
    try {
      const response = await chatbotClient.post<CreateSessionResponse>(
        CHATBOT_ENDPOINTS.CREATE_SESSION
      );
      return response.data;
    } catch (error) {
      console.error("세션 생성 실패:", error);
      throw error;
    }
  },

  sendMessageStream: async (
    chatData: ChatMessage,
    onMessage: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${chatbotClient.defaults.baseURL}${CHATBOT_ENDPOINTS.SEND_MESSAGE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chatData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // 줄 단위로 분할하여 처리
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          if (line.startsWith("data:")) {
            const data = line.slice(5);

            if (data === "[DONE]") {
              onComplete();
              return;
            }

            if (data === "") continue;

            const processedData = data.replace(/\\n/g, "\n");

            onMessage(processedData);
          }
        }
      }
    } catch (error) {
      console.error("스트리밍 메시지 전송 실패:", error);
      onError(error as Error);
    }
  },
};
