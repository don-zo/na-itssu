package com.donzo.naitssu.domain.meeting.service;

import com.donzo.naitssu.domain.meeting.dto.MeetingPageResponse;
import com.donzo.naitssu.domain.meeting.dto.MeetingResponse;
import com.donzo.naitssu.domain.meeting.entity.Meeting;
import com.donzo.naitssu.domain.meeting.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MeetingService {
    
    private final MeetingRepository meetingRepository;
    
    /**
     * 회의 목록을 커서 기반 페이지네이션으로 조회 (최신순)
     * 
     * @param cursor 커서 (이전 페이지의 마지막 회의 ID, null이면 첫 페이지)
     * @param size 페이지 크기 (기본값: 10)
     * @return 커서 기반 페이지네이션된 회의 목록
     */
    public MeetingPageResponse getMeetings(Long cursor, int size) {
        // 페이지 크기 제한 (최대 50개)
        if (size > 50) {
            size = 50;
        }
        if (size <= 0) {
            size = 10;
        }
        
        Pageable pageable = PageRequest.of(0, size + 1); // +1로 다음 페이지 존재 여부 확인
        List<Meeting> meetings;
        
        if (cursor == null) {
            // 첫 번째 페이지
            meetings = meetingRepository.findTopByOrderByConfDateDescCreatedAtDescIdDesc(pageable);
            log.info("회의 목록 조회 (첫 페이지) - 크기: {}", size);
        } else {
            // 다음 페이지
            meetings = meetingRepository.findByCursorOrderByConfDateDescCreatedAtDescIdDesc(cursor, pageable);
            log.info("회의 목록 조회 (커서: {}) - 크기: {}", cursor, size);
        }
        
        // 다음 페이지 존재 여부 확인
        boolean hasNext = meetings.size() > size;
        if (hasNext) {
            meetings = meetings.subList(0, size); // 실제 반환할 데이터는 size개만
        }
        
        List<MeetingResponse> meetingResponses = meetings.stream()
                .map(MeetingResponse::from)
                .toList();
        
        // 다음 커서 설정 (마지막 회의의 ID)
        Long nextCursor = null;
        if (hasNext && !meetings.isEmpty()) {
            nextCursor = meetings.get(meetings.size() - 1).getId();
        }
        
        log.info("회의 목록 조회 완료 - 반환: {}개, 다음페이지: {}, 다음커서: {}", 
                meetingResponses.size(), hasNext, nextCursor);
        
        return MeetingPageResponse.builder()
                .meetings(meetingResponses)
                .size(size)
                .hasNext(hasNext)
                .nextCursor(nextCursor)
                .build();
    }
    
}
