package com.donzo.naitssu.domain.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class UpstageRequest {
    private String model;
    private List<Message> messages;
    private boolean stream;

    @Getter
    @AllArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }
}
