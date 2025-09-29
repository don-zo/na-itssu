package com.donzo.naitssu.domain.meeting.service;

import com.donzo.naitssu.domain.chatbot.dto.UpstageRequest;
import com.donzo.naitssu.domain.meeting.dto.MeetingAnalysisResult;
import com.donzo.naitssu.domain.meeting.dto.StructuredUpstageRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class StructuredMeetingAnalysisService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${upstage.api.key}")
    private String apiKey;

    @Value("${upstage.api.url}")
    private String apiUrl;

    public Mono<MeetingAnalysisResult> analyzeWithStructuredOutput(String parsedText, String meetingTitle) {
        log.info("구조화된 회의 분석 시작: {}", meetingTitle);

        // 텍스트가 너무 긴 경우 청크로 분할 (약 25,000 토큰 = 대략 80,000 글자)
        int maxChunkLength = 80000; // 매우 안전한 청크 크기 (한국어 토큰 밀도 고려)
        
        if (parsedText.length() <= maxChunkLength) {
            return analyzeChunkWithStructuredOutput(parsedText, meetingTitle, 1, 1);
        } else {
            return analyzeChunksWithStructuredOutput(parsedText, meetingTitle, maxChunkLength);
        }
    }

    private Mono<MeetingAnalysisResult> analyzeChunksWithStructuredOutput(String text, String meetingTitle, int maxChunkLength) {
        log.info("긴 텍스트 청크 분할 분석 시작: {} (길이: {})", meetingTitle, text.length());
        
        List<String> chunks = splitTextIntoChunks(text, maxChunkLength);
        List<Mono<MeetingAnalysisResult>> analysisMonos = new ArrayList<>();
        
        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            analysisMonos.add(analyzeChunkWithStructuredOutput(chunk, meetingTitle, i + 1, chunks.size())
                    .onErrorReturn(new MeetingAnalysisResult(List.of())));
        }
        
        return Flux.fromIterable(analysisMonos)
                .flatMap(mono -> mono)
                .collectList()
                .map(results -> {
                    // 모든 청크의 분석 결과를 통합
                    List<String> allDiscussionItems = new ArrayList<>();
                    
                    for (MeetingAnalysisResult result : results) {
                        if (result.getDiscussionItems() != null) {
                            allDiscussionItems.addAll(result.getDiscussionItems());
                        }
                    }
                    
                    // 중복 제거 및 최대 5개로 제한
                    List<String> finalDiscussionItems = allDiscussionItems.stream()
                            .distinct()
                            .limit(5)
                            .toList();
                    
                    log.info("청크 분석 통합 완료: {} - 논의사항 {}개", 
                            meetingTitle, finalDiscussionItems.size());
                    
                    return new MeetingAnalysisResult(finalDiscussionItems);
                });
    }

    private Mono<MeetingAnalysisResult> analyzeChunkWithStructuredOutput(String parsedText, String meetingTitle, int chunkIndex, int totalChunks) {
        String systemPrompt = """
                당신은 대한민국 국회 본회의 회의록을 전문적으로 분석하는 AI입니다.
                
                분석 지침:
                1. 주요 논의사항: 회의에서 논의된 핵심 안건, 이슈, 쟁점사항들을 추출 (최대 5개)
                2. 최소 1개 이상, 최대 5개 이하로 제한
                3. 각 10글자 내외로 작성.
                4. 중복되지 않는 서로 다른 항목들로 구성
                5. 중요도 순으로 정렬하여 상위 5개만 선택
                
                주의사항:
                - 추상적이거나 일반적인 내용보다는 구체적인 내용 우선
                - 각 항목은 간결하면서도 핵심 내용을 포함
                - 실제 논의된 안건과 쟁점사항 위주로 추출
                """;

        String chunkInfo = totalChunks > 1 ? String.format(" (부분 %d/%d)", chunkIndex, totalChunks) : "";
        String userPrompt = String.format("""
                다음은 "%s"%s 회의록 내용입니다. 
                이 회의에서 논의된 주요 사항들을 구조화된 형태로 추출해주세요:
                
                %s
                """, meetingTitle, chunkInfo, parsedText);

        List<UpstageRequest.Message> messages = List.of(
                new UpstageRequest.Message("system", systemPrompt),
                new UpstageRequest.Message("user", userPrompt)
        );

        StructuredUpstageRequest request = new StructuredUpstageRequest("solar-pro2", messages);

        return webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(request)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), 
                         response -> response.bodyToMono(String.class)
                                 .flatMap(errorBody -> {
                                     log.error("Structured Output API 오류 - 상태: {}, 응답: {}", 
                                             response.statusCode(), errorBody);
                                     return Mono.error(new RuntimeException("Structured Output API 호출 실패: " + 
                                             response.statusCode() + " - " + errorBody));
                                 }))
                .bodyToMono(String.class)
                .flatMap(this::parseStructuredResponse)
                .doOnSuccess(result -> {
                    if (result != null) {
                        log.info("구조화된 분석 완료{}: {} - 논의사항 {}개", 
                                chunkInfo, meetingTitle, 
                                result.getDiscussionItems() != null ? result.getDiscussionItems().size() : 0);
                    }
                })
                .doOnError(error -> log.error("구조화된 분석 실패{}: {} - {}", chunkInfo, meetingTitle, error.getMessage()));
    }

    private List<String> splitTextIntoChunks(String text, int maxChunkLength) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        
        while (start < text.length()) {
            int end = Math.min(start + maxChunkLength, text.length());
            
            // 문장 중간에서 자르지 않도록 조정
            if (end < text.length()) {
                int lastPeriod = text.lastIndexOf('.', end);
                int lastNewline = text.lastIndexOf('\n', end);
                int lastSpace = text.lastIndexOf(' ', end);
                
                int cutPoint = Math.max(Math.max(lastPeriod, lastNewline), lastSpace);
                if (cutPoint > start + maxChunkLength / 2) { // 너무 뒤로 가지 않도록
                    end = cutPoint + 1;
                }
            }
            
            chunks.add(text.substring(start, end).trim());
            start = end;
        }
        
        log.info("구조화된 분석용 텍스트 분할 완료: 총 {}개 청크 (평균 길이: {})", 
                chunks.size(), chunks.stream().mapToInt(String::length).average().orElse(0));
        
        return chunks;
    }

    private Mono<MeetingAnalysisResult> parseStructuredResponse(String responseBody) {
        try {
            log.debug("Structured API 응답: {}", responseBody.length() > 200 ? 
                     responseBody.substring(0, 200) + "..." : responseBody);

            // Upstage API 응답에서 content 추출
            var jsonNode = objectMapper.readTree(responseBody);
            var choices = jsonNode.get("choices");
            
            if (choices != null && choices.isArray() && choices.size() > 0) {
                var content = choices.get(0).get("message").get("content").asText();
                
                // JSON 문자열을 MeetingAnalysisResult로 파싱
                MeetingAnalysisResult result = objectMapper.readValue(content, MeetingAnalysisResult.class);
                
                // 최소 요구사항 검증
                if (result.getDiscussionItems() == null || result.getDiscussionItems().isEmpty()) {
                    log.warn("논의사항이 없음, 기본값 추가");
                    result.setDiscussionItems(List.of("회의 진행 및 안건 논의"));
                }
                
                return Mono.just(result);
            } else {
                log.error("Upstage API 응답에서 choices를 찾을 수 없음");
                return Mono.error(new RuntimeException("Invalid API response structure"));
            }
            
        } catch (Exception e) {
            log.error("구조화된 응답 파싱 실패: {}", e.getMessage());
            log.error("응답 내용: {}", responseBody);
            return Mono.error(new RuntimeException("구조화된 응답 파싱 실패: " + e.getMessage()));
        }
    }
}
