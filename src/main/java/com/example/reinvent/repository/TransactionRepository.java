package com.example.reinvent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.reinvent.entity.Transaction;
import com.example.reinvent.entity.TransactionDetail;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCustomerName(String customerName);
    List<Transaction> findByCustomerId(String customerId);
    List<Transaction> findByJoinedDate(String date);
    
    @Query("SELECT t FROM Transaction t WHERE t.referredCustomerId1 = :referralId OR t.referredCustomerId2 = :referralId")
    List<Transaction> findByReferredCustomerId1OrReferredCustomerId2(@Param("referralId") String referralId);
    
    List<Transaction> findByReferredCustomerId1(String referredCustomerId1);
    List<Transaction> findByReferredCustomerId2(String referredCustomerId2);    
    List<Transaction> findByReferralId(String referralId);
    
}