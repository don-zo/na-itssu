package com.donzo.naitssu.domain.bill.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class ChatGptRequest {
    private String model = "gpt-3.5-turbo";
    private List<Message> messages;
    private double temperature = 0.7;
    
    @JsonProperty("max_tokens")
    private int maxTokens = 500;

    @Data
    public static class Message {
        private String role;
        private String content;

        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }
}
