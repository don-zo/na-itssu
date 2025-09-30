package com.donzo.naitssu.domain.chatbot.controller;

import com.donzo.naitssu.domain.chatbot.dto.ChatRequest;
import com.donzo.naitssu.domain.chatbot.service.ChatBotService;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatBotController {

    private final ChatBotService chatBotService;

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(@RequestBody ChatRequest request) {
        log.info("챗봇 스트리밍 요청: billId={}, meetingId={}, message={}, sessionId={}", 
                request.getBillId(), request.getMeetingId(), request.getMessage(), request.getSessionId());
        
        return chatBotService.chatStream(request)
                .filter(Objects::nonNull)
                .map(chunk -> {
                    log.debug("컨트롤러에서 받은 chunk: '{}'", chunk);
                    chunk = chunk.replace("\n", "\\n");
                    return chunk;
                })
                .concatWith(Flux.just("[DONE]"))
                .doOnComplete(() -> log.info("챗봇 스트리밍 완료"))
                .onErrorReturn("죄송합니다. 서비스에 문제가 발생했습니다.");
    }


    @PostMapping("/session")
    public ResponseEntity<Map<String, String>> createSession() {
        String sessionId = chatBotService.createSession();
        Map<String, String> response = new HashMap<>();
        response.put("sessionId", sessionId);
        log.info("새 세션 생성: sessionId={}", sessionId);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ChatBot API is running");
    }
}
