package com.donzo.naitssu.domain.meeting.controller;

import com.donzo.naitssu.domain.meeting.dto.MeetingPageResponse;
import com.donzo.naitssu.domain.meeting.dto.MeetingResponse;
import com.donzo.naitssu.domain.meeting.service.MeetingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
@Slf4j
public class MeetingController {
    
    private final MeetingService meetingService;
    
    /**
     * 회의 목록 조회 (커서 기반 페이지네이션)
     * GET /api/meetings?cursor=123&size=10
     * 
     * @param cursor 커서 (이전 페이지의 마지막 회의 ID, null이면 첫 페이지)
     * @param size 페이지 크기 (기본값: 10, 최대: 50)
     * @return 커서 기반 페이지네이션된 회의 목록
     */
    @GetMapping
    public ResponseEntity<MeetingPageResponse> getMeetings(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("회의 목록 조회 요청 - 커서: {}, 크기: {}", cursor, size);
        
        try {
            MeetingPageResponse response = meetingService.getMeetings(cursor, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("회의 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
}
