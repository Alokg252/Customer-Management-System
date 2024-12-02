package com.example.reinvent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.reinvent.entity.Transaction;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCustomerName(String customerName);
    List<Transaction> findByCustomerId(String customerId);
    List<Transaction> findByDate(String date);
    List<Transaction> findByReferredCustomerId1OrReferredCustomerId2(String referralId);
}
