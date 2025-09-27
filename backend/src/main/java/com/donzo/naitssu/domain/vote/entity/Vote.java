package com.donzo.naitssu.domain.vote.entity;

import com.donzo.naitssu.domain.bill.entity.Bill;
import com.donzo.naitssu.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "votes", indexes = {
    @Index(name = "idx_vote_bill_id", columnList = "bill_id"),
    @Index(name = "idx_vote_ip_bill", columnList = "voter_ip, bill_id", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Vote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @Column(nullable = false)
    private Boolean isAgree;

    @Column(name = "voter_ip", nullable = false, length = 45)
    private String voterIp;

    @Builder
    public Vote(Bill bill, Boolean isAgree, String voterIp) {
        this.bill = bill;
        this.isAgree = isAgree;
        this.voterIp = voterIp;
    }
}
