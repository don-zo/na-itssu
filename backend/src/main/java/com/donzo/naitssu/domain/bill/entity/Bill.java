package com.donzo.naitssu.domain.bill.entity;

import com.donzo.naitssu.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bills")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Bill extends BaseEntity {

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Builder
    public Bill(String title, String summary) {
        this.title = title;
        this.summary = summary;
    }
}
