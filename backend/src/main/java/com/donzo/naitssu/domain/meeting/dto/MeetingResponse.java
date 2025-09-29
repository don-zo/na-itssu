package com.donzo.naitssu.domain.meeting.dto;

import com.donzo.naitssu.domain.meeting.entity.Meeting;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MeetingResponse {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private Long id;

    @JsonProperty("confer_num")
    private String conferNum; // 회의번호

    private String title; // 회의명

    @JsonProperty("class_name")
    private String className; // 회의종류명

    @JsonProperty("dae_num")
    private String daeNum; // 대수

    @JsonProperty("conf_date")
    private String confDate; // 회의날짜

    @JsonProperty("sub_name")
    private String subName; // 안건명

    @JsonProperty("vod_link_url")
    private String vodLinkUrl; // 영상회의록 링크

    @JsonProperty("conf_link_url")
    private String confLinkUrl; // 요약정보 팝업

    @JsonProperty("pdf_link_url")
    private String pdfLinkUrl; // PDF파일 링크

    @JsonProperty("conf_id")
    private String confId; // 회의ID

    private String summary; // PDF 요약 내용

    @JsonProperty("discussion_items")
    private List<String> discussionItems; // 주요 논의사항

    @JsonProperty("created_at")
    private LocalDateTime createdAt; // 생성일시

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt; // 수정일시

    public static MeetingResponse from(Meeting meeting) {
        List<String> discussionItems = List.of();

        if (meeting.getDiscussionItems() != null && !meeting.getDiscussionItems().trim().isEmpty()) {
            try {
                // ObjectMapper를 사용하여 JSON 문자열을 List로 변환
                discussionItems = objectMapper.readValue(
                        meeting.getDiscussionItems(),
                        new TypeReference<>() {}
                );
            } catch (Exception e) {
                // 파싱 실패 시 빈 리스트
                discussionItems = List.of();
            }
        }

        return MeetingResponse.builder()
                .id(meeting.getId())
                .conferNum(meeting.getConferNum())
                .title(meeting.getTitle())
                .className(meeting.getClassName())
                .daeNum(meeting.getDaeNum())
                .confDate(meeting.getConfDate())
                .subName(meeting.getSubName())
                .vodLinkUrl(meeting.getVodLinkUrl())
                .confLinkUrl(meeting.getConfLinkUrl())
                .pdfLinkUrl(meeting.getPdfLinkUrl())
                .confId(meeting.getConfId())
                .summary(meeting.getSummary())
                .discussionItems(discussionItems)
                .createdAt(meeting.getCreatedAt())
                .updatedAt(meeting.getUpdatedAt())
                .build();
    }
}
