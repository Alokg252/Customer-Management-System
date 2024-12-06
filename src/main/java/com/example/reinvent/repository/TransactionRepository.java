package com.example.reinvent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.reinvent.entity.Transaction;
import com.example.reinvent.entity.TransactionDetail;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    @Query("SELECT DISTINCT t FROM Transaction t WHERE " +
           "LOWER(t.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.customerId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.mobile) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.referralId) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Transaction> searchTransactions(@Param("searchTerm") String searchTerm);

    @Query("SELECT t FROM Transaction t WHERE LOWER(t.customerName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Transaction> findByCustomerNameContainingIgnoreCase(@Param("name") String name);

    @Query("SELECT t FROM Transaction t WHERE LOWER(t.customerId) LIKE LOWER(CONCAT('%', :id, '%'))")
    List<Transaction> findByCustomerIdContainingIgnoreCase(@Param("id") String customerId);

    @Query("SELECT t FROM Transaction t WHERE LOWER(t.mobile) LIKE LOWER(CONCAT('%', :mobile, '%'))")
    List<Transaction> findByMobileContainingIgnoreCase(@Param("mobile") String mobile);

    @Query("SELECT t FROM Transaction t WHERE LOWER(t.referralId) LIKE LOWER(CONCAT('%', :referralId, '%'))")
    List<Transaction> findByReferralIdContainingIgnoreCase(@Param("referralId") String referralId);

    List<Transaction> findByCustomerName(String customerName);
    List<Transaction> findByCustomerId(String customerId);
    List<Transaction> findByJoinedDate(String date);
    
    @Query("SELECT t FROM Transaction t WHERE t.referredCustomerId1 = :referralId OR t.referredCustomerId2 = :referralId")
    List<Transaction> findByReferredCustomerId1OrReferredCustomerId2(@Param("referralId") String referralId);
    
    List<Transaction> findByReferredCustomerId1(String referredCustomerId1);
    List<Transaction> findByReferredCustomerId2(String referredCustomerId2);    
    List<Transaction> findByReferralId(String referralId);
    
}