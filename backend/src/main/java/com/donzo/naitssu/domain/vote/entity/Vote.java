package com.donzo.naitssu.domain.vote.entity;

import com.donzo.naitssu.domain.bill.entity.Bill;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "votes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Vote {

    @Id
    @Column(name = "bill_id")
    private Long billId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", insertable = false, updatable = false)
    private Bill bill;

    @Column(name = "agree_count", nullable = false)
    private Integer agreeCount = 0;

    @Column(name = "disagree_count", nullable = false)
    private Integer disagreeCount = 0;

    @Column(name = "total_count", nullable = false)
    private Integer totalCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Builder
    public Vote(Long billId, Integer agreeCount, Integer disagreeCount, Integer totalCount) {
        this.billId = billId;
        this.agreeCount = agreeCount != null ? agreeCount : 0;
        this.disagreeCount = disagreeCount != null ? disagreeCount : 0;
        this.totalCount = totalCount != null ? totalCount : (this.agreeCount + this.disagreeCount);
    }

    public void incrementAgree() {
        this.agreeCount++;
        this.totalCount++;
        this.updatedAt = java.time.LocalDateTime.now();
    }

    public void incrementDisagree() {
        this.disagreeCount++;
        this.totalCount++;
        this.updatedAt = java.time.LocalDateTime.now();
    }

    public void incrementAgreeBy(int n) {
        int add = Math.max(0, n);
        if (add == 0) return;
        this.agreeCount += add;
        this.totalCount += add;
        this.updatedAt = java.time.LocalDateTime.now();
    }

    public void incrementDisagreeBy(int n) {
        int add = Math.max(0, n);
        if (add == 0) return;
        this.disagreeCount += add;
        this.totalCount += add;
        this.updatedAt = java.time.LocalDateTime.now();
    }

    public void decrementAgree() {
        if (this.agreeCount > 0) {
            this.agreeCount--;
            if (this.totalCount > 0) this.totalCount--;
        }
    }

    public void decrementDisagree() {
        if (this.disagreeCount > 0) {
            this.disagreeCount--;
            if (this.totalCount > 0) this.totalCount--;
        }
    }
}
