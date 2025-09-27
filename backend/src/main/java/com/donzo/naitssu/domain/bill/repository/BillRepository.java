package com.donzo.naitssu.domain.bill.repository;

import com.donzo.naitssu.domain.bill.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
}
