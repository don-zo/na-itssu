package com.donzo.naitssu.domain.assembly.entity;

import com.donzo.naitssu.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "assembly_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AssemblySession extends BaseEntity {

    @Column(name = "assembly_number", nullable = false)
    private Integer assemblyNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;

    @Column(name = "discussion_topics", columnDefinition = "TEXT")
    private String discussionTopics;

    @Column(name = "keywords", length = 1000)
    private String keywords;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Builder
    public AssemblySession(Integer assemblyNumber, String title, LocalDateTime sessionDate, 
                          String discussionTopics, String keywords, String aiSummary, 
                          String pdfUrl, String videoUrl) {
        this.assemblyNumber = assemblyNumber;
        this.title = title;
        this.sessionDate = sessionDate;
        this.discussionTopics = discussionTopics;
        this.keywords = keywords;
        this.aiSummary = aiSummary;
        this.pdfUrl = pdfUrl;
        this.videoUrl = videoUrl;
    }

    public void updateAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public void updateUrls(String pdfUrl, String videoUrl) {
        this.pdfUrl = pdfUrl;
        this.videoUrl = videoUrl;
    }
}
