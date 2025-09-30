package com.donzo.naitssu.domain.bill.repository;

import com.donzo.naitssu.domain.bill.entity.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    @Query("select b from Bill b left join com.donzo.naitssu.domain.vote.entity.Vote v on v.billId = b.id order by coalesce(v.totalCount, 0) desc, b.id desc")
    Page<Bill> findAllOrderByVotesDesc(Pageable pageable);

    Page<Bill> findByBillNameContainingIgnoreCase(String keyword, Pageable pageable);

    @Query("select b from Bill b where (:tag is null or b.tag = :tag) order by b.id desc")
    Page<Bill> findByTagOrderByLatest(@Param("tag") String tag, Pageable pageable);

    @Query("select b from Bill b left join com.donzo.naitssu.domain.vote.entity.Vote v on v.billId = b.id where (:tag is null or b.tag = :tag) order by coalesce(v.totalCount, 0) desc, b.id desc")
    Page<Bill> findByTagOrderByVotesDesc(@Param("tag") String tag, Pageable pageable);
}
