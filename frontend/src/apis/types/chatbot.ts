export interface CreateSessionResponse {
  sessionId: string;
}

export interface ChatMessage {
  message: string;
  sessionId: string;
  billId?: number;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
}
