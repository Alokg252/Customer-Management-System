package com.example.reinvent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.reinvent.entity.Transaction;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    

/**
 * Searches for transactions where the customer name, customer ID, mobile number, 
 * or referral ID contains the specified search term, ignoring case.
 * 
 * @param searchTerm the term to search for within transaction fields
 * @return a list of transactions matching the search criteria
 */
    @Query("SELECT t FROM Transaction t WHERE " +
           "LOWER(t.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.customerId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.mobile) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.referralId) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Transaction> searchTransactions(@Param("searchTerm") String searchTerm);

    /**
     * Finds transactions whose customer name contains the specified string, ignoring case.
     * 
     * @param name the name to search for within customer names
     * @return a list of transactions with matching customer names
     */
    @Query("SELECT t FROM Transaction t WHERE LOWER(t.customerName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Transaction> findByCustomerNameContainingIgnoreCase(@Param("name") String name);

/**
 * Finds transactions where the customer ID contains the specified ID string, ignoring case.
 * 
 * @param customerId the customer ID string to search for within transaction customer IDs
 * @return a list of transactions with matching customer IDs
 */
    @Query("SELECT t FROM Transaction t WHERE LOWER(t.customerId) LIKE LOWER(CONCAT('%', :id, '%'))")
    List<Transaction> findByCustomerIdContainingIgnoreCase(@Param("id") String customerId);

    /**
     * Finds transactions where the customer mobile number contains the specified string, ignoring case.
     * 
     * @param mobile the mobile number string to search for within transaction mobile numbers
     * @return a list of transactions with matching mobile numbers
     */
    @Query("SELECT t FROM Transaction t WHERE LOWER(t.mobile) LIKE LOWER(CONCAT('%', :mobile, '%'))")
    List<Transaction> findByMobileContainingIgnoreCase(@Param("mobile") String mobile);

    /**
     * Finds transactions where the referral ID contains the specified string, ignoring case.
     * 
     * @param referralId the referral ID string to search for within transaction referral IDs
     * @return a list of transactions with matching referral IDs
     */
    @Query("SELECT t FROM Transaction t WHERE LOWER(t.referralId) LIKE LOWER(CONCAT('%', :referralId, '%'))")
    List<Transaction> findByReferralIdContainingIgnoreCase(@Param("referralId") String referralId);

    List<Transaction> findByCustomerId(String customerId);
    List<Transaction> findByReferralId(String referralId);
    // List<Transaction> findByJoinedDate(String date);
    List<Transaction> findByDate(String date);
    List<Transaction> findByCustomerName(String name);
    List<Transaction> findByMobile(String mobile);
    List<Transaction> findByReferredCustomerId1(String referredCustomerId1);
    List<Transaction> findByReferredCustomerId2(String referredCustomerId2);

    @Query("SELECT t FROM Transaction t WHERE t.referredCustomerId1 = :referralId OR t.referredCustomerId2 = :referralId")
    List<Transaction> findByReferredCustomerId1OrReferredCustomerId2(@Param("referralId") String referralId);
}

// The code appears to be well-structured and follows JPA repository conventions. 
// However, there are a few potential improvements or checks you might consider:

// 1. Ensure all fields used in queries (like 'mobile', 'referralId', etc.) actually exist in the Transaction entity.
// 2. Check the consistency of query logic, such as verifying if case-insensitivity is needed for all fields.
// 3. Verify if unique constraints are correctly handled, especially with 'customerId', 'referralId', 'referredCustomerId1', and 'referredCustomerId2'.
// 4. Consider adding pagination and sorting parameters to the repository methods for better performance on large datasets.
// 5. Ensure that the methods defined in the repository are actually used in the service layer to avoid unused code.
