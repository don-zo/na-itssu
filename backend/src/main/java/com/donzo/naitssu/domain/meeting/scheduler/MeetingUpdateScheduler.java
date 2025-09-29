package com.donzo.naitssu.domain.meeting.scheduler;

import com.donzo.naitssu.domain.meeting.service.MeetingUpdateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MeetingUpdateScheduler {

    private final MeetingUpdateService meetingUpdateService;

    // 매일 10시, 15시, 19시에 실행
    @Scheduled(cron = "0 0 10,15,19 * * *")
    public void updateMeetingData() {
        log.info("회의 정보 스케줄러 시작");
        
        try {
            meetingUpdateService.updateMeetingData();
            log.info("회의 정보 스케줄러 완료");
        } catch (Exception e) {
            log.error("회의 정보 스케줄러 실행 중 오류 발생", e);
        }
    }
    
    // 애플리케이션 시작 시 한 번 실행
    @Scheduled(initialDelay = 10000, fixedDelay = Long.MAX_VALUE)
    public void initialUpdate() {
        log.info("초기 회의 정보 업데이트 시작");
        
        try {
            meetingUpdateService.updateMeetingData();
            log.info("초기 회의 정보 업데이트 완료");
        } catch (Exception e) {
            log.error("초기 회의 정보 업데이트 중 오류 발생", e);
        }
    }
}
