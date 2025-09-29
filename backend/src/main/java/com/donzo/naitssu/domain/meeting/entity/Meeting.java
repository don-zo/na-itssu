package com.donzo.naitssu.domain.meeting.entity;

import com.donzo.naitssu.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "meetings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Meeting extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String conferNum; // 회의번호 (CONFER_NUM)

    @Column(nullable = false, length = 500)
    private String title; // 회의명 (TITLE)

    @Column(length = 100)
    private String className; // 회의종류명 (CLASS_NAME)

    @Column(length = 10)
    private String daeNum; // 대수 (DAE_NUM)

    @Column(length = 20)
    private String confDate; // 회의날짜 (CONF_DATE)

    @Column(columnDefinition = "TEXT")
    private String subName; // 안건명 (SUB_NAME)

    @Column(columnDefinition = "TEXT")
    private String vodLinkUrl; // 영상회의록 링크 (VOD_LINK_URL)

    @Column(columnDefinition = "TEXT")
    private String confLinkUrl; // 요약정보 팝업 (CONF_LINK_URL)

    @Column(columnDefinition = "TEXT")
    private String pdfLinkUrl; // PDF파일 링크 (PDF_LINK_URL)

    @Column(length = 50)
    private String confId; // 회의ID (CONF_ID)

    @Column(columnDefinition = "TEXT")
    private String summary; // PDF 요약 내용

    @Column(columnDefinition = "JSON")
    private String discussionItems; // 주요 논의사항 (JSON 배열)

    @Builder
    public Meeting(String conferNum, String title, String className, String daeNum, 
                  String confDate, String subName, String vodLinkUrl, String confLinkUrl, 
                  String pdfLinkUrl, String confId, String summary, String discussionItems) {
        this.conferNum = conferNum;
        this.title = title;
        this.className = className;
        this.daeNum = daeNum;
        this.confDate = confDate;
        this.subName = subName;
        this.vodLinkUrl = vodLinkUrl;
        this.confLinkUrl = confLinkUrl;
        this.pdfLinkUrl = pdfLinkUrl;
        this.confId = confId;
        this.summary = summary;
        this.discussionItems = discussionItems;
    }
    
    public void updateSummary(String summary) {
        this.summary = summary;
    }
    
    public void updateAnalysis(String discussionItems) {
        this.discussionItems = discussionItems;
    }
}
