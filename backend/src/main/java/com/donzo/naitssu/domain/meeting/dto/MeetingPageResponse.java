package com.donzo.naitssu.domain.meeting.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MeetingPageResponse {
    
    private List<MeetingResponse> meetings; // 회의 목록
    
    private int size; // 요청한 크기
    
    @JsonProperty("has_next")
    private boolean hasNext; // 다음 페이지 존재 여부
    
    @JsonProperty("next_cursor")
    private Long nextCursor; // 다음 페이지를 위한 커서 (마지막 회의의 ID)
    
    @JsonProperty("total_count")
    private Long totalCount; // 전체 회의 수 (선택적)
}
