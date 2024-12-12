package com.example.reinvent.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.reinvent.entity.Transaction;
import com.example.reinvent.entity.TransactionDetail;

@Repository
public interface TransactionDetailRepository extends JpaRepository<TransactionDetail, Long> {
    
    // @Query("SELECT t FROM TransactionDetail t WHERE t.transactions = :transaction")
    List<TransactionDetail> findByTransactions(@Param("transaction") Transaction transaction);

    // @Query("SELECT t FROM TransactionDetail t WHERE t.transactions.id = :id")
    List<TransactionDetail> findByTransactionsId(@Param("id") Long id);
}
