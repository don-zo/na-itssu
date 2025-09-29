package com.donzo.naitssu.domain.meeting.service;

import com.donzo.naitssu.domain.chatbot.dto.UpstageRequest;
import com.donzo.naitssu.domain.chatbot.service.UpstageApiService;
import com.donzo.naitssu.domain.meeting.dto.MeetingAnalysisResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingSummaryService {

    private final DocumentParserService documentParserService;
    private final PdfProcessingService pdfProcessingService;
    private final UpstageApiService upstageApiService;
    private final StructuredMeetingAnalysisService structuredMeetingAnalysisService;
    private final ObjectMapper objectMapper;

    public Mono<String> generateSummaryFromPdf(String pdfUrl, String meetingTitle) {
        if (pdfUrl == null || pdfUrl.trim().isEmpty()) {
            log.warn("PDF URL이 비어있어 요약 생성 불가: {}", meetingTitle);
            return Mono.just("");
        }

        log.info("회의 PDF 요약 생성 시작: {} - {}", meetingTitle, pdfUrl);

        String filename = pdfProcessingService.extractFilenameFromUrl(pdfUrl);

        return pdfProcessingService.downloadPdf(pdfUrl)
                .filter(pdfData -> pdfData.length > 0)
                .flatMap(pdfData -> documentParserService.parseDocumentToText(pdfData, filename))
                .filter(text -> !text.trim().isEmpty())
                .flatMap(parsedText -> generateSummaryWithSolar(parsedText, meetingTitle))
                .doOnSuccess(summary -> {
                    if (summary != null && !summary.trim().isEmpty()) {
                        log.info("회의 PDF 요약 생성 완료: {} (길이: {})", meetingTitle, summary.length());
                    } else {
                        log.warn("회의 PDF 요약이 비어있음: {}", meetingTitle);
                    }
                })
                .doOnError(error -> log.error("회의 PDF 요약 생성 실패: {} - {}", meetingTitle, error.getMessage()))
                .onErrorReturn(""); // 오류 시 빈 문자열 반환
    }

    private Mono<String> generateSummaryWithSolar(String text, String meetingTitle) {
        // 텍스트가 너무 긴 경우 청크로 분할 (약 25,000 토큰 = 대략 80,000 글자)
        int maxChunkLength = 80000; // 매우 안전한 청크 크기 (한국어 토큰 밀도 고려)

        if (text.length() <= maxChunkLength) {
            return generateSummaryChunk(text, meetingTitle, 1, 1);
        } else {
            return generateSummaryFromChunks(text, meetingTitle, maxChunkLength);
        }
    }

    private Mono<String> generateSummaryFromChunks(String text, String meetingTitle, int maxChunkLength) {
        log.info("긴 텍스트 청크 분할 요약 시작: {} (길이: {})", meetingTitle, text.length());

        List<String> chunks = splitTextIntoChunks(text, maxChunkLength);
        List<Mono<String>> summaryMonos = new ArrayList<>();

        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            summaryMonos.add(generateSummaryChunk(chunk, meetingTitle, i + 1, chunks.size())
                    .onErrorReturn(""));
        }

        return Flux.fromIterable(summaryMonos)
                .flatMap(mono -> mono)
                .collectList()
                .flatMap(summaries -> {
                    // 각 청크의 요약을 하나로 통합
                    String combinedSummaries = summaries.stream()
                            .filter(summary -> !summary.trim().isEmpty())
                            .reduce("", (a, b) -> a + "\n\n" + b)
                            .trim();

                    if (combinedSummaries.isEmpty()) {
                        return Mono.just("");
                    }

                    // 통합된 요약을 다시 한 번 요약 (최종 정리)
                    return generateFinalSummary(combinedSummaries, meetingTitle);
                });
    }

    private Mono<String> generateSummaryChunk(String text, String meetingTitle, int chunkIndex, int totalChunks) {
        String systemPrompt = """
                당신은 국회 본회의 회의록 요약을 하나로 통합해 법에 무지한 사람에게 잘 설명하는 AI입니다.
                
                요약 지침:
                1. 3 ~ 4줄 이내로 간결하게 작성
                2. 무조건 줄글로 작성, 기타 다른 사항 절대 기재 금지.
                3. 마크다운 문법 사용 금지
                4. 습니다. 체 사용 존댓말 사용
                """;

        String chunkInfo = totalChunks > 1 ? String.format(" (부분 %d/%d)", chunkIndex, totalChunks) : "";
        String userPrompt = String.format("""
                다음은 "%s"%s 회의록 내용입니다. 이를 하나의 완성된 요약(반드시 줄글, 3~4문장)으로 통합해주세요:
                
                %s
                """, meetingTitle, chunkInfo, text);

        List<UpstageRequest.Message> messages = List.of(
                new UpstageRequest.Message("system", systemPrompt),
                new UpstageRequest.Message("user", userPrompt)
        );

        return upstageApiService.chat(messages)
                .map(response -> {
                    // 응답이 기본 오류 메시지인 경우 빈 문자열 반환
                    if (response.startsWith("죄송합니다")) {
                        return "";
                    }
                    return response;
                });
    }

    private Mono<String> generateFinalSummary(String combinedSummaries, String meetingTitle) {
        String systemPrompt = """
                당신은 여러 부분으로 나뉜 국회 본회의 회의록 요약을 하나로 통합해 법에 무지한 사람에게 잘 설명하는 AI입니다.
                
                통합 지침:
                1. 3 ~ 4줄 이내로 간결하게 작성
                2. 무조건 줄글로 작성, 기타 다른 사항 절대 기재 금지.
                3. 중복된 내용은 제거하고 핵심만 유지
                4. 마크다운 문법 사용 금지
                5. 습니다. 체 사용 존댓말 사용
                """;

        String userPrompt = String.format("""
                무조건 줄글로 작성, 기타 다른 사항 절대 기재 금지.
                다음은 "%s" 회의록의 부분별 요약들입니다. 이를 하나의 완성된 요약(반드시 줄글, 3~4문장)으로 통합해주세요:
                
                %s
                """, meetingTitle, combinedSummaries);

        List<UpstageRequest.Message> messages = List.of(
                new UpstageRequest.Message("system", systemPrompt),
                new UpstageRequest.Message("user", userPrompt)
        );

        return upstageApiService.chat(messages)
                .map(response -> {
                    if (response.startsWith("죄송합니다")) {
                        return combinedSummaries; // 통합 실패 시 원본 반환
                    }
                    return response;
                });
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
        
        log.info("텍스트 분할 완료: 총 {}개 청크 (평균 길이: {})", 
                chunks.size(), chunks.stream().mapToInt(String::length).average().orElse(0));
        
        return chunks;
    }

    public Mono<MeetingAnalysisData> generateSummaryAndAnalysisFromPdf(String pdfUrl, String meetingTitle) {
        if (pdfUrl == null || pdfUrl.trim().isEmpty()) {
            log.warn("PDF URL이 비어있어 분석 생성 불가: {}", meetingTitle);
            return Mono.just(new MeetingAnalysisData("", "[]"));
        }

        log.info("회의 PDF 요약 및 구조화된 분석 생성 시작: {} - {}", meetingTitle, pdfUrl);

        String filename = pdfProcessingService.extractFilenameFromUrl(pdfUrl);

        return pdfProcessingService.downloadPdf(pdfUrl)
                .filter(pdfData -> pdfData.length > 0)
                .flatMap(pdfData -> documentParserService.parseDocumentToText(pdfData, filename))
                .filter(text -> !text.trim().isEmpty())
                .flatMap(parsedText -> {
                    // 요약과 구조화된 분석을 병렬로 실행
                    Mono<String> summaryMono = generateSummaryWithSolar(parsedText, meetingTitle);
                    Mono<MeetingAnalysisResult> analysisMono = structuredMeetingAnalysisService.analyzeWithStructuredOutput(parsedText, meetingTitle);

                    return Mono.zip(summaryMono, analysisMono)
                            .map(tuple -> {
                                String summary = tuple.getT1();
                                MeetingAnalysisResult analysis = tuple.getT2();
                                
                                try {
                                    String discussionJson = analysis.getDiscussionItems() != null ? 
                                            objectMapper.writeValueAsString(analysis.getDiscussionItems()) : "[]";
                                    
                                    return new MeetingAnalysisData(summary, discussionJson);
                                } catch (Exception e) {
                                    log.error("JSON 변환 실패: {}", e.getMessage());
                                    return new MeetingAnalysisData(summary, "[]");
                                }
                            });
                })
                .doOnSuccess(result -> {
                    if (result != null && !result.getSummary().trim().isEmpty()) {
                        log.info("회의 PDF 요약 및 분석 생성 완료: {}", meetingTitle);
                    } else {
                        log.warn("회의 PDF 요약 및 분석이 비어있음: {}", meetingTitle);
                    }
                })
                .doOnError(error -> log.error("회의 PDF 요약 및 분석 생성 실패: {} - {}", meetingTitle, error.getMessage()))
                .onErrorReturn(new MeetingAnalysisData("", "[]")); // 오류 시 빈 데이터 반환
    }

    // 분석 결과를 담는 데이터 클래스
    public static class MeetingAnalysisData {
        private final String summary;
        private final String discussionItemsJson;

        public MeetingAnalysisData(String summary, String discussionItemsJson) {
            this.summary = summary;
            this.discussionItemsJson = discussionItemsJson;
        }

        public String getSummary() { return summary; }
        public String getDiscussionItemsJson() { return discussionItemsJson; }
    }
}
