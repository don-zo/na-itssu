package com.donzo.naitssu.domain.meeting.service;

import com.donzo.naitssu.domain.meeting.dto.MeetingApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingApiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${assembly.api.key}")
    private String apiKey;

    @Value("${assembly.api.meeting.url}")
    private String apiUrl;
    private static final String CURRENT_DAE_NUM = "22"; // 22대 국회
    
    public Mono<MeetingApiResponse> fetchMeetingData(int pageIndex) {
        String currentYear = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
        
        return webClient.get()
                .uri(apiUrl + "?Key=" + apiKey + 
                     "&Type=json" +
                     "&pIndex=" + pageIndex +
                     "&pSize=100" +
                     "&DAE_NUM=" + CURRENT_DAE_NUM +
                     "&CONF_DATE=" + currentYear)
                .retrieve()
                .bodyToMono(String.class)
                .flatMap(this::parseJsonResponse)
                .doOnSuccess(response -> {
                    if (response != null && response.getHeads() != null && !response.getHeads().isEmpty()) {
                        var head = response.getHeads().get(0);
                        if (head.getHead() != null && !head.getHead().isEmpty()) {
                            // head 배열에서 정보 추출
                            int totalCount = 0;
                            String resultCode = "N/A";
                            
                            for (Object headObj : head.getHead()) {
                                if (headObj instanceof LinkedHashMap) {
                                    @SuppressWarnings("unchecked")
                                    Map<String, Object> headMap = (LinkedHashMap<String, Object>) headObj;
                                    
                                    if (headMap.containsKey("list_total_count")) {
                                        totalCount = (Integer) headMap.get("list_total_count");
                                    }
                                    
                                    if (headMap.containsKey("RESULT")) {
                                        @SuppressWarnings("unchecked")
                                        Map<String, String> resultMap = (LinkedHashMap<String, String>) headMap.get("RESULT");
                                        resultCode = resultMap.get("CODE");
                                    }
                                }
                            }
                            
                            log.info("API 호출 성공 - 페이지: {}, 총 개수: {}, 결과 코드: {}", 
                                    pageIndex, totalCount, resultCode);
                        }
                        
                        // row 데이터 개수 로그 (모든 head 객체에서 row 찾기)
                        int totalRowCount = 0;
                        for (var headObj : response.getHeads()) {
                            if (headObj.getRow() != null) {
                                totalRowCount += headObj.getRow().size();
                                log.info("페이지 {} - 실제 데이터 개수: {}", pageIndex, headObj.getRow().size());
                            }
                        }
                        if (totalRowCount == 0) {
                            log.warn("페이지 {} - row 데이터가 없음", pageIndex);
                        }
                    }
                })
                .doOnError(error -> log.error("API 호출 실패 - 페이지: {}, 오류: {}", pageIndex, error.getMessage()));
    }

    private Mono<MeetingApiResponse> parseJsonResponse(String responseBody) {
        try {
            log.debug("국회 API 원본 응답: {}", responseBody.length() > 200 ? 
                     responseBody.substring(0, 200) + "..." : responseBody);
            
            MeetingApiResponse response = objectMapper.readValue(responseBody, MeetingApiResponse.class);
            log.debug("JSON 파싱 성공");
            return Mono.just(response);
        } catch (Exception e) {
            log.error("JSON 파싱 실패: {}", e.getMessage());
            log.error("응답 내용: {}", responseBody);
            return Mono.error(new RuntimeException("국회 API 응답 파싱 실패: " + e.getMessage()));
        }
    }
}
