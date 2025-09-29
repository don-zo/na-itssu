package com.donzo.naitssu.domain.bill.entity;

import com.donzo.naitssu.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "bills")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Bill extends BaseEntity {

    @Column(name = "bill_no")
    private Integer billNo;

    @Column(name = "bill_name", nullable = false, length = 255)
    private String billName;

    @Column(name = "propose_date")
    private LocalDate proposeDate;

    @Column(name = "proposer", length = 255)
    private String proposer;

    @Column(name = "proposer_kind", length = 50)
    private String proposerKind;

    // 제거: summary 컬럼(원문 JSON). 분리 저장 컬럼만 사용

    @Column(name = "stage", length = 50)
    private String stage;

    // Upstage JSON 분리 저장 컬럼들
    @Column(name = "summary_background", columnDefinition = "TEXT")
    private String summaryBackground; // background 배열 JSON 문자열

    @Column(name = "summary_content", columnDefinition = "TEXT")
    private String summaryContent; // content 배열 JSON 문자열

    @Column(name = "summary_effect", columnDefinition = "TEXT")
    private String summaryEffect; // effect 배열 JSON 문자열

    @Column(name = "summary_line", length = 1000)
    private String summaryLine; // 한 줄 요약

    @Column(name = "summary_highlight", length = 255)
    private String summaryHighlight; // [핵심 요지]

    @Column(name = "tag", length = 20)
    private String tag; // 분류 태그: 전체, 교통, 주거, 경제, 환경, 고용, 기타

    @Builder
    public Bill(Integer billNo, String billName, LocalDate proposeDate, String proposer,
                String proposerKind, String stage,
                String summaryBackground, String summaryContent, String summaryEffect,
                String summaryLine, String summaryHighlight, String tag) {
        this.billNo = billNo;
        this.billName = billName;
        this.proposeDate = proposeDate;
        this.proposer = proposer;
        this.proposerKind = proposerKind;
        this.stage = stage;
        this.summaryBackground = summaryBackground;
        this.summaryContent = summaryContent;
        this.summaryEffect = summaryEffect;
        this.summaryLine = summaryLine;
        this.summaryHighlight = summaryHighlight;
        this.tag = tag;
    }

    // 챗봇 호환 전용 접근자 (DB 스키마 변경 없이 제공)
    public String getTitle() {
        return this.billName;
    }

    public String getSummary() {
        if (this.summaryLine != null && !this.summaryLine.isBlank()) {
            return this.summaryLine;
        }
        // 요약문이 없으면 background/content/effect를 간단 합성 (있을 때만)
        StringBuilder sb = new StringBuilder();
        if (this.summaryBackground != null && !this.summaryBackground.isBlank()) {
            sb.append("배경: ").append(this.summaryBackground).append("\n");
        }
        if (this.summaryContent != null && !this.summaryContent.isBlank()) {
            sb.append("내용: ").append(this.summaryContent).append("\n");
        }
        if (this.summaryEffect != null && !this.summaryEffect.isBlank()) {
            sb.append("효과: ").append(this.summaryEffect);
        }
        String combined = sb.toString().trim();
        return combined.isEmpty() ? "요약 정보가 없습니다." : combined;
    }

    // title 제거: billName만 사용
}
