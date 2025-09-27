package com.donzo.naitssu.domain.chatbot.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatRequest {
    private Long billId;
    private String message;
    private String sessionId;
}
