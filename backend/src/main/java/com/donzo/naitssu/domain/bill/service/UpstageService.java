package com.donzo.naitssu.domain.bill.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpstageService {

    private final WebClient webClient;

    @Value("${upstage.api.key}")
    private String apiKey;

    @Value("${upstage.api.url}")
    private String apiUrl;

    public String generateBillSummary(String billName, String billContent) {
        String prompt = String.format("""
            다음 법안에 대해 아래 JSON 스펙대로만 출력하세요. 설명문 없이, 오직 유효한 JSON만 반환.

            법안명: %s
            법안 내용: %s

            출력 형식(JSON):
            {
              "summaryBackground": "문단으로 정리 (두세 줄 이내). 반드시 아래 요소가 들어가야 함:\n    - 현행법에서 이미 규정된 내용\n    - 빠져 있는 부분이나 문제가 된 점\n    - 문제로 인해 발생하는 구체적인 불편·한계",
              "summaryContent": [
                "새로 추가되거나 강화되는 규정",
                "개정 조항별 핵심 포인트",
                "쉬운 표현으로 조항을 나열 (예: '법을 어기면 해임 가능', '겸직을 금지')"
              ],
              "summaryEffect": [
                "위원회·제도 운영상 개선점",
                "국민이 체감할 수 있는 효과",
                "사회적 신뢰·공정성 회복 효과"
              ],
              "summaryLine": "일반인이 바로 이해할 수 있는 한 문장",
              "summaryHighlight": "[핵심 요지]",
              "tag": "전체 | 교통 | 주거 | 경제 | 환경 | 고용 | 기타"
            }

            규칙:
            - 반드시 유효한 JSON만 반환(키/문자열에 쌍따옴표)
            - summaryBackground는 두세 줄 이내의 문단으로 작성
            - summaryContent와 summaryEffect는 불릿포인트 배열로 작성
            - summaryLine은 한 줄짜리 자연스러운 한국어 문장
            - summaryHighlight는 대괄호 포함 문자열 (예: "[겸직 금지, 해임 규정 강화]")
            - tag는 법안 주제에 따라 "전체", "교통", "주거", "경제", "환경", "고용", "기타" 중 하나만 선택
            - 위 목록에 해당하지 않으면 반드시 "기타"로 설정
            """, billName, billContent);

        // Upstage API 요청 형식
        Map<String, Object> request = Map.of(
            "model", "solar-1-mini-chat",
            "messages", List.of(
                Map.of("role", "system", "content", "당신은 법안을 일반인이 이해하기 쉽게 설명하는 전문가입니다."),
                Map.of("role", "user", "content", prompt)
            ),
            "max_tokens", 1000,
            "temperature", 0.7
        );

        try {
            log.info("Upstage API 요약 생성 시작: billName={}", billName);

            Map<String, Object> response = webClient
                .post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                    .filter(throwable -> {
                        if (throwable instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                            org.springframework.web.reactive.function.client.WebClientResponseException ex =
                                (org.springframework.web.reactive.function.client.WebClientResponseException) throwable;
                            return ex.getStatusCode().value() == 429; // Too Many Requests
                        }
                        return false;
                    })
                    .doBeforeRetry(retrySignal -> {
                        log.warn("Upstage API 재시도 중... 시도 횟수: {}, 에러: {}",
                            retrySignal.totalRetries() + 1, retrySignal.failure().getMessage());
                    }))
                .doOnNext(resp -> log.info("Upstage API 호출 성공"))
                .doOnError(error -> log.error("Upstage API 호출 최종 실패: {}", error.getMessage()))
                .onErrorReturn(Map.of())
                .block();

            if (response != null && response.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String summary = (String) message.get("content");
                    log.info("Upstage API 요약 생성 완료: length={}", summary.length());
                    return summary;
                }
            }

            log.warn("Upstage API 응답이 비어있음, 기본 요약 반환");
            return "법안 요약: " + billName + "에 대한 상세한 내용은 추후 제공될 예정입니다.";
        } catch (Exception e) {
            log.error("Upstage API 호출 중 오류 발생: {}", e.getMessage(), e);
            return "법안 요약: " + billName + "에 대한 상세한 내용은 추후 제공될 예정입니다.";
        }
    }
}