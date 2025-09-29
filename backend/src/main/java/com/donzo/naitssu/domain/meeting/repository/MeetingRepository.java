package com.donzo.naitssu.domain.meeting.repository;

import com.donzo.naitssu.domain.meeting.entity.Meeting;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    
    Optional<Meeting> findByConferNum(String conferNum);
    
    boolean existsByConferNum(String conferNum);
    
    /**
     * 회의 날짜 기준 최신순으로 페이지네이션하여 조회
     * confDate가 null이거나 빈 값인 경우 생성일시 기준으로 정렬
     */
    @Query("SELECT m FROM Meeting m ORDER BY " +
           "CASE WHEN m.confDate IS NOT NULL AND m.confDate != '' " +
           "THEN m.confDate ELSE '1900-01-01' END DESC, m.createdAt DESC")
    Page<Meeting> findAllOrderByConfDateDesc(Pageable pageable);
    
    /**
     * 커서 기반 페이지네이션 - 첫 번째 페이지
     * 최신순으로 limit개 조회
     */
    @Query("SELECT m FROM Meeting m ORDER BY " +
           "CASE WHEN m.confDate IS NOT NULL AND m.confDate != '' " +
           "THEN m.confDate ELSE '1900-01-01' END DESC, m.createdAt DESC, m.id DESC")
    List<Meeting> findTopByOrderByConfDateDescCreatedAtDescIdDesc(Pageable pageable);
    
    /**
     * 커서 기반 페이지네이션 - 다음 페이지
     * 특정 ID보다 작은 회의들을 최신순으로 limit개 조회
     */
    @Query("SELECT m FROM Meeting m WHERE m.id < :cursor ORDER BY " +
           "CASE WHEN m.confDate IS NOT NULL AND m.confDate != '' " +
           "THEN m.confDate ELSE '1900-01-01' END DESC, m.createdAt DESC, m.id DESC")
    List<Meeting> findByCursorOrderByConfDateDescCreatedAtDescIdDesc(Long cursor, Pageable pageable);
}
