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
              "background": [
                "..."
              ],
              "content": [
                "..."
              ],
              "effect": [
                "..."
              ],
              "summary": "...",
              "highlight": "[...]",
              "tag": "전체 | 교통 | 주거 | 경제 | 환경 | 고용 | 기타"
            }

            규칙:
            - 반드시 유효한 JSON만 반환(키/문자열에 쌍따옴표)
            - 배열 항목은 간결한 한 문장(예: "법을 어기면 해임 가능", "겸직 금지")
            - highlight는 대괄호 포함 문자열(예: "[겸직 금지, 해임 규정 강화]")
            - 요약/표현은 한국어
            - tag는 다음 중 하나의 정확한 값만 사용: "전체", "교통", "주거", "경제", "환경", "고용", "기타"
            - tag는 법안의 주된 주제를 기준으로 단 하나만 선택
            - 위 목록 외의 값이 판단될 경우 반드시 "기타"로 설정
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