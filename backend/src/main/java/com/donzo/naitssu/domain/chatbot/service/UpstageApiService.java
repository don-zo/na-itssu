package com.donzo.naitssu.domain.chatbot.service;

import com.donzo.naitssu.domain.chatbot.dto.UpstageRequest;
import com.donzo.naitssu.domain.chatbot.dto.UpstageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpstageApiService {

    private final WebClient webClient;

    @Value("${upstage.api.key}")
    private String apiKey;

    @Value("${upstage.api.url:https://api.upstage.ai/v1/chat/completions}")
    private String apiUrl;

    public Mono<String> chat(List<UpstageRequest.Message> messages) {
        UpstageRequest request = new UpstageRequest("solar-pro2", messages, false);

        return webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(UpstageResponse.class)
                .map(response -> {
                    if (response.getChoices() != null && !response.getChoices().isEmpty()) {
                        return response.getChoices().get(0).getMessage().getContent();
                    }
                    return "죄송합니다. 응답을 생성할 수 없습니다.";
                })
                .doOnError(error -> log.error("Upstage API 호출 실패", error))
                .onErrorReturn("죄송합니다. 서비스에 일시적인 문제가 발생했습니다.");
    }

    public Flux<String> chatStream(List<UpstageRequest.Message> messages) {
        UpstageRequest request = new UpstageRequest("solar-pro2", messages, true);

        return webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.ACCEPT, MediaType.TEXT_EVENT_STREAM_VALUE)
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(String.class)
                .doOnNext(line -> log.debug("원본 스트림 라인: {}", line))
                .filter(line -> !line.equals("[DONE]") && !line.trim().isEmpty())
                .map(this::extractContentFromStreamResponse)
                .filter(content -> content != null && !content.isEmpty())
                .doOnNext(content -> log.debug("최종 추출된 컨텐츠: '{}'", content))
                .doOnError(error -> log.error("Upstage API 스트리밍 실패", error))
                .onErrorReturn("죄송합니다. 서비스에 일시적인 문제가 발생했습니다.");
    }

    private String extractContentFromStreamResponse(String json) {
        try {
            log.debug("JSON 파싱 시도: {}", json);
            
            // delta.content가 있는 경우 (실제 텍스트 내용)
            if (json.contains("\"delta\":{") && json.contains("\"content\":")) {
                int deltaStart = json.indexOf("\"delta\":{");
                int contentStart = json.indexOf("\"content\":\"", deltaStart);
                if (contentStart != -1) {
                    contentStart += 11; // "content":" 길이
                    int contentEnd = contentStart;
                    
                    // 올바른 끝 따옴표 찾기 (이스케이프된 따옴표 고려)
                    while (contentEnd < json.length()) {
                        contentEnd = json.indexOf("\"", contentEnd);
                        if (contentEnd == -1) break;
                        
                        // 이스케이프된 따옴표가 아닌 경우
                        if (contentEnd == 0 || json.charAt(contentEnd - 1) != '\\') {
                            break;
                        }
                        contentEnd++;
                    }
                    
                    if (contentEnd > contentStart && contentEnd != -1) {
                        String content = json.substring(contentStart, contentEnd);
                        // 이스케이프 문자 처리
                        content = content.replace("\\n", "\n")
                                        .replace("\\\"", "\"")
                                        .replace("\\\\", "\\");
                        log.debug("추출된 content: '{}'", content);
                        return content;
                    }
                }
            }
            
            // delta만 있고 content가 없는 경우 (role 설정 등)
            if (json.contains("\"delta\":{") && json.contains("\"role\":")) {
                log.debug("role 설정 chunk, content 없음");
                return "";
            }
            
            return "";
        } catch (Exception e) {
            log.warn("스트림 응답 파싱 실패: {}", json, e);
            return "";
        }
    }
}
