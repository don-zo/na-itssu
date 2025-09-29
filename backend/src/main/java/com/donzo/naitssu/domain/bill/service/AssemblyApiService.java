package com.donzo.naitssu.domain.bill.service;

import com.donzo.naitssu.domain.bill.dto.AssemblyApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssemblyApiService {

    private final WebClient webClient;

    @Value("${assembly.api.key}")
    private String apiKey;

    public AssemblyApiResponse getBills(int pageIndex, int pageSize, int age) {
        try {
            log.info("국회 API 호출 시작: pageIndex={}, pageSize={}, age={}, apiKey={}", 
                    pageIndex, pageSize, age, apiKey != null ? "설정됨" : "설정되지 않음");
            
                   // 원시 응답 받기
                   String rawResponse = webClient
                       .get()
                       .uri(uriBuilder -> uriBuilder
                           .scheme("https")
                           .host("open.assembly.go.kr")
                           .path("/portal/openapi/TVBPMBILL11")
                           .queryParam("KEY", apiKey)
                           .queryParam("Type", "json")
                           .queryParam("pIndex", pageIndex)
                           .queryParam("pSize", pageSize)
                           .queryParam("AGE", age)
                           .build())
                       .retrieve()
                       .bodyToMono(String.class)
                       .block();
            
            log.info("국회 API 원시 응답: {}", rawResponse);
            
            // 응답 파싱
            AssemblyApiResponse response = parseResponse(rawResponse);
            
            log.info("국회 API 호출 성공: pageIndex={}, pageSize={}, age={}", pageIndex, pageSize, age);
            return response;
        } catch (Exception e) {
            log.error("국회 API 호출 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("국회 API 호출 실패", e);
        }
    }
    
    private AssemblyApiResponse parseResponse(String rawResponse) {
        try {
            log.info("JSON 응답 파싱 시작");
            
            // JSON 파싱을 위한 ObjectMapper 사용
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode jsonNode = objectMapper.readTree(rawResponse);
            
            AssemblyApiResponse response = new AssemblyApiResponse();
            List<AssemblyApiResponse.BillItem> bills = new ArrayList<>();
            
            // TVBPMBILL11 배열에서 row 데이터 추출
            JsonNode tvbpmbill11 = jsonNode.get("TVBPMBILL11");
            if (tvbpmbill11 != null && tvbpmbill11.isArray()) {
                for (JsonNode item : tvbpmbill11) {
                    JsonNode row = item.get("row");
                    if (row != null && row.isArray()) {
                        for (JsonNode billData : row) {
                            AssemblyApiResponse.BillItem billItem = new AssemblyApiResponse.BillItem();
                            billItem.setBillId(billData.get("BILL_ID").asText());
                            billItem.setBillNo(billData.get("BILL_NO").asText());
                            billItem.setBillName(billData.get("BILL_NAME").asText());
                            billItem.setProposeDate(billData.get("PROPOSE_DT").asText());
                            billItem.setProposer(billData.get("PROPOSER").asText());
                            billItem.setProposerKind(billData.get("PROPOSER_KIND").asText());
                            
                            // 단계 판단 로직 적용
                            String stage = determineStage(billData);
                            billItem.setStage(stage);
                            
                            billItem.setLinkUrl(billData.get("LINK_URL").asText());
                            
                            bills.add(billItem);
                        }
                    }
                }
            }
            
            response.setBills(bills);
            log.info("JSON 응답 파싱 완료: {} 개의 법안 데이터", bills.size());
            return response;
        } catch (Exception e) {
            log.error("응답 파싱 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("응답 파싱 실패", e);
        }
    }

    public String getBillContent(String billNo) {
        try {
            log.info("법안 요약 API 호출 시작: billNo={}", billNo);
            
            // BPMBILLSUMMARY API 호출 (BILL_NO 사용)
            String rawResponse = webClient
                .get()
                .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host("open.assembly.go.kr")
                    .path("/portal/openapi/BPMBILLSUMMARY")
                    .queryParam("KEY", apiKey)
                    .queryParam("Type", "json")
                    .queryParam("pIndex", 1)
                    .queryParam("pSize", 1)
                    .queryParam("BILL_NO", billNo)
                    .build())
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .header("Accept", "application/json")
                .retrieve()
                .bodyToMono(String.class)
                .retry(3)
                .block();

            log.info("법안 요약 API 원시 응답: {}", rawResponse);

            // HTML 응답인지 확인
            if (rawResponse.trim().startsWith("<!DOCTYPE") || rawResponse.trim().startsWith("<HTML")) {
                log.warn("HTML 응답을 받았습니다. 기본 내용 반환");
                return "법안 상세 내용을 가져올 수 없습니다.";
            }

            // JSON 파싱
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode jsonNode = objectMapper.readTree(rawResponse);

            // BPMBILLSUMMARY 배열에서 summary 데이터 추출
            JsonNode bpmbillsummary = jsonNode.get("BPMBILLSUMMARY");
            if (bpmbillsummary != null && bpmbillsummary.isArray()) {
                for (JsonNode item : bpmbillsummary) {
                    JsonNode row = item.get("row");
                    if (row != null && row.isArray()) {
                        for (JsonNode summaryData : row) {
                            String summary = summaryData.get("SUMMARY").asText();
                            log.info("법안 요약 추출 성공: length={}", summary.length());
                            return summary;
                        }
                    }
                }
            }

            log.warn("법안 요약을 찾을 수 없음, 기본 내용 반환");
            return "법안 상세 내용을 가져올 수 없습니다.";
        } catch (Exception e) {
            log.error("법안 요약 API 호출 중 오류 발생: {}", e.getMessage(), e);
            return "법안 상세 내용을 가져올 수 없습니다.";
        }
    }

    private String determineStage(JsonNode billData) {
        // PROC_RESULT_CD가 있으면 "처리 완료"
        if (billData.has("PROC_RESULT_CD") && !billData.get("PROC_RESULT_CD").isNull()) {
            return "처리 완료";
        }
        
        // LAW_PROC_RESULT_CD가 있으면 "본회의 의결"
        if (billData.has("LAW_PROC_RESULT_CD") && !billData.get("LAW_PROC_RESULT_CD").isNull()) {
            return "본회의 의결";
        }
        
        // LAW_PRESENT_DT가 있으면 "본회의 부의"
        if (billData.has("LAW_PRESENT_DT") && !billData.get("LAW_PRESENT_DT").isNull()) {
            return "본회의 부의";
        }
        
        // CMT_PROC_RESULT_CD가 있으면 "소관위 의결"
        if (billData.has("CMT_PROC_RESULT_CD") && !billData.get("CMT_PROC_RESULT_CD").isNull()) {
            return "소관위 의결";
        }
        
        // CURR_COMMITTEE 또는 CURR_COMMITTEE_ID가 있으면 "소관위 심사 중"
        if ((billData.has("CURR_COMMITTEE") && !billData.get("CURR_COMMITTEE").isNull()) ||
            (billData.has("CURR_COMMITTEE_ID") && !billData.get("CURR_COMMITTEE_ID").isNull())) {
            return "소관위 심사 중";
        }
        
        // 그 외의 경우 "접수(발의)"
        return "접수(발의)";
    }
}
