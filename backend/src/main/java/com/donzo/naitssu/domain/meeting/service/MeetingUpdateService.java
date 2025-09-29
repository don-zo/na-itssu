package com.donzo.naitssu.domain.meeting.service;

import com.donzo.naitssu.domain.meeting.dto.MeetingApiResponse;
import com.donzo.naitssu.domain.meeting.entity.Meeting;
import com.donzo.naitssu.domain.meeting.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingUpdateService {

    private final MeetingApiService meetingApiService;
    private final MeetingRepository meetingRepository;
    private final MeetingSummaryService meetingSummaryService;

    @Transactional
    public void updateMeetingData() {
        log.info("회의 정보 업데이트 시작");
        
        AtomicInteger totalProcessed = new AtomicInteger(0);
        AtomicInteger totalNew = new AtomicInteger(0);
        int pageIndex = 1;
        boolean hasMoreData = true;

        while (hasMoreData) {
            try {
                MeetingApiResponse response = meetingApiService.fetchMeetingData(pageIndex).block();
                
                if (response == null || response.getHeads() == null || response.getHeads().isEmpty()) {
                    log.warn("API 응답이 비어있음 - 페이지: {}", pageIndex);
                    break;
                }

                // 결과 확인 및 데이터 처리 (모든 head 객체 순회)
                boolean hasError = false;
                List<MeetingApiResponse.MeetingData> allMeetingData = new ArrayList<>();
                
                for (var head : response.getHeads()) {
                    // 결과 확인
                    if (head.getHead() != null && !head.getHead().isEmpty()) {
                        for (Object headObj : head.getHead()) {
                            if (headObj instanceof LinkedHashMap) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> headMap = (LinkedHashMap<String, Object>) headObj;
                                
                                if (headMap.containsKey("RESULT")) {
                                    @SuppressWarnings("unchecked")
                                    Map<String, String> resultMap = (LinkedHashMap<String, String>) headMap.get("RESULT");
                                    String code = resultMap.get("CODE");
                                    String message = resultMap.get("MESSAGE");
                                    
                                    if (!"INFO-000".equals(code)) {
                                        log.warn("API 오류 - 코드: {}, 메시지: {}", code, message);
                                        hasError = true;
                                    }
                                }
                            }
                        }
                    }
                    
                    // row 데이터 수집
                    if (head.getRow() != null && !head.getRow().isEmpty()) {
                        allMeetingData.addAll(head.getRow());
                        log.info("페이지 {} - head 객체에서 {} 개 데이터 발견", pageIndex, head.getRow().size());
                    }
                }
                
                if (hasError) break;

                // 데이터 처리
                if (!allMeetingData.isEmpty()) {
                    List<MeetingApiResponse.MeetingData> meetingDataList = allMeetingData;
                    
                    for (MeetingApiResponse.MeetingData meetingData : meetingDataList) {
                        if (meetingData.getConferNum() != null && 
                            !meetingRepository.existsByConferNum(meetingData.getConferNum())) {
                            
                            Meeting meeting = Meeting.builder()
                                    .conferNum(meetingData.getConferNum())
                                    .title(meetingData.getTitle())
                                    .className(meetingData.getClassName())
                                    .daeNum(meetingData.getDaeNum())
                                    .confDate(meetingData.getConfDate())
                                    .subName(meetingData.getSubName())
                                    .vodLinkUrl(meetingData.getVodLinkUrl())
                                    .confLinkUrl(meetingData.getConfLinkUrl())
                                    .pdfLinkUrl(meetingData.getPdfLinkUrl())
                                    .confId(meetingData.getConfId())
                                    .summary("") // 초기에는 빈 요약
                                    .discussionItems("[]") // 초기에는 빈 배열
                                    .build();
                            
                            Meeting savedMeeting = meetingRepository.save(meeting);
                            totalNew.incrementAndGet();
                            log.debug("새 회의 정보 저장: {}", meetingData.getConferNum());
                            
                            // PDF 요약 및 구조화된 분석 비동기 생성 (백그라운드에서 처리)
                            generateAnalysisAsync(savedMeeting, meetingData.getPdfLinkUrl(), meetingData.getTitle());
                        }
                        totalProcessed.incrementAndGet();
                    }
                    
                    log.info("페이지 {} 처리 완료 - 처리된 개수: {}", pageIndex, meetingDataList.size());
                    
                    // 다음 페이지 확인 (100개 미만이면 마지막 페이지)
                    if (meetingDataList.size() < 100) {
                        hasMoreData = false;
                    } else {
                        pageIndex++;
                    }
                } else {
                    log.info("더 이상 데이터가 없음 - 페이지: {} (수집된 데이터: {} 개)", pageIndex, allMeetingData.size());
                    hasMoreData = false;
                }
                
                // API 호출 간격 (너무 빠르게 호출하지 않도록)
                Thread.sleep(100);
                
            } catch (Exception e) {
                log.error("회의 정보 업데이트 중 오류 발생 - 페이지: {}", pageIndex, e);
                break;
            }
        }

        log.info("회의 정보 업데이트 완료 - 총 처리: {}, 신규 추가: {}", 
                totalProcessed.get(), totalNew.get());
    }

    private void generateAnalysisAsync(Meeting meeting, String pdfUrl, String meetingTitle) {
        if (pdfUrl == null || pdfUrl.trim().isEmpty()) {
            log.debug("PDF URL이 없어 분석 생성 건너뜀: {}", meeting.getConferNum());
            return;
        }

        // 별도 스레드에서 요약 및 구조화된 분석 생성 (메인 스케줄러 블로킹 방지)
        Thread.startVirtualThread(() -> {
            try {
                MeetingSummaryService.MeetingAnalysisData analysisData = 
                        meetingSummaryService.generateSummaryAndAnalysisFromPdf(pdfUrl, meetingTitle)
                                .block(); // 비동기 처리를 위해 block 사용

                if (analysisData != null && !analysisData.getSummary().trim().isEmpty()) {
                    // 요약 및 분석 업데이트 (별도 트랜잭션)
                    updateMeetingAnalysis(meeting.getId(), analysisData);
                    log.info("회의 요약 및 구조화된 분석 생성 완료: {} - {}", meeting.getConferNum(), meetingTitle);
                } else {
                    log.warn("회의 요약 및 분석 생성 실패 또는 빈 결과: {} - {}", meeting.getConferNum(), meetingTitle);
                }
            } catch (Exception e) {
                log.error("회의 요약 및 분석 생성 중 오류: {} - {}", meeting.getConferNum(), meetingTitle, e);
            }
        });
    }

    @Transactional
    public void updateMeetingAnalysis(Long meetingId, MeetingSummaryService.MeetingAnalysisData analysisData) {
        meetingRepository.findById(meetingId)
                .ifPresent(meeting -> {
                    meeting.updateSummary(analysisData.getSummary());
                    meeting.updateAnalysis(analysisData.getDiscussionItemsJson());
                    meetingRepository.save(meeting);
                });
    }
}
