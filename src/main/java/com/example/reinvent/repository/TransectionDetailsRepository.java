package com.example.reinvent.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.reinvent.entity.TransactionDetail;

public interface TransectionDetailsRepository extends JpaRepository<TransactionDetail, Long> {

    List<TransactionDetail> findByTransactionsId(Long transactionsId);

    @Query("SELECT t FROM TransactionDetail t WHERE t.transactions.customerId = :customerId")
    List<TransactionDetail> findByCustomerId(String customerId);
    
}
