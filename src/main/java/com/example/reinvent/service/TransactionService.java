package com.example.reinvent.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.reinvent.repository.TransactionDetailRepository;
import com.example.reinvent.repository.TransactionRepository;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.dao.CannotAcquireLockException;
import com.example.reinvent.entity.Transaction;
import com.example.reinvent.entity.TransactionDetail;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TransactionDetailRepository transactionDetailRepository;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getTransactionsByCustomerName(String customerName) {
        return transactionRepository.findByCustomerName(customerName);
    }

    public List<Transaction> getTransactionsByCustomerId(String customerId) {
        return transactionRepository.findByCustomerId(customerId);
    }
    //------------------- Ignore Cases --------------------
    
    public List<Transaction> searchTransactions(String query){
        return transactionRepository.searchTransactions(query);
    }
    public List<Transaction> findByCustomerIdContainingIgnoreCase(String customerId){
        return transactionRepository.findByCustomerIdContainingIgnoreCase(customerId);    
    }
    
    public List<Transaction> findByCustomerNameContainingIgnoreCase(String customerName){
        return transactionRepository.findByCustomerNameContainingIgnoreCase(customerName);    
    }
    
    public List<Transaction> findByMobileContainingIgnoreCase(String customerMobile){
        return transactionRepository.findByMobileContainingIgnoreCase(customerMobile);    
    }
    
    public List<Transaction> findByReferralIdContainingIgnoreCase(String customerReferralId){
        return transactionRepository.findByReferralIdContainingIgnoreCase(customerReferralId);    
    }

//-------------------------------------------------

public List<Transaction> getTransactionsByDate(String date) {
        return transactionRepository.findByDate(date);
    }

    public List<Transaction> getTransactionsByReferralId(String referralId) {
        return transactionRepository.findByReferralId(referralId);
    }

    public List<Transaction> getTransactionsByReferredCustomerId1(String referredCustomerId1) {
        return transactionRepository.findByReferredCustomerId1(referredCustomerId1);
    }

    public List<Transaction> getTransactionsByReferredCustomerId2(String referredCustomerId2) {
        return transactionRepository.findByReferredCustomerId2(referredCustomerId2);
    }

    public List<Transaction> getTransactionsByReferredCustomerIds(String referredCustomerId) {
        return transactionRepository.findByReferredCustomerId1OrReferredCustomerId2(referredCustomerId);
    }

    public Transaction saveTransaction(Transaction transaction) {

        try {
            return transactionRepository.save(transaction);
        } catch (JpaSystemException e) {
            System.out.println("\n-----------------------------------------------\n");
            System.out.println(e.getClass());
            System.out.println("\n-----------------------------------------------\n");
            System.out.println(e.getMessage());
        } catch (CannotAcquireLockException e) {
            System.out.println("\n-----------------------------------------------\n");
            System.out.println(e.getClass());
            System.out.println("\n-----------------------------------------------\n");
            System.out.println(e.getMessage());
        } catch (Exception e) {
            System.out.println("\n-----------------------------------------------\n");
            System.out.println(e.getClass());
            System.out.println(e.getMessage());
            System.out.println("\n-----------------------------------------------\n");
        }

        return null;
    }

    public void validateReferrals(Transaction transaction) {
        if (transaction.getReferredCustomerId1() != null && transaction.getReferredCustomerId2() != null) {
            Transaction referrer = transactionRepository.findByCustomerId(transaction.getReferredCustomerId1()).get(0);
            if (referrer != null
                    && (referrer.getReferredCustomerId1() != null && referrer.getReferredCustomerId2() != null)) {
                throw new IllegalArgumentException("Referrer has already referred two customers.");
            }
        }
    }

    // Update transaction (including customer information)
    public Transaction updateTransaction(Long id, Transaction updatedTransaction) {
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + id));

        // Update transaction fields
        existingTransaction.setCustomerName(updatedTransaction.getCustomerName());
        existingTransaction.setCustomerId(updatedTransaction.getCustomerId());
        existingTransaction.setReferralId(updatedTransaction.getReferralId());
        existingTransaction.setReferredCustomerId1(updatedTransaction.getReferredCustomerId1());
        existingTransaction.setReferredCustomerId2(updatedTransaction.getReferredCustomerId2());
        existingTransaction.setDate(updatedTransaction.getDate());
        existingTransaction.setDetails(updatedTransaction.getDetails());

        return transactionRepository.save(existingTransaction);
    }

    // Delete a single transaction
    public boolean deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            return false;
        }
        transactionRepository.deleteById(id);
        return true;
    }

    // Delete all transactions for a specific customer
    public boolean deleteTransactionsByCustomer(String customerId) {
        List<Transaction> transactions = transactionRepository.findByCustomerId(customerId);
        if (transactions.isEmpty()) {
            return false;
        }
        transactionRepository.deleteAll(transactions);
        return true;
    }

    public List<TransactionDetail> TransactionDetailsByTransaction(String customerId){
        List<Transaction> transactions = transactionRepository.findByCustomerId(customerId);
        if (transactions.isEmpty()) {
            return null;
        }
        return transactionDetailRepository.findByTransactions(transactions.get(0));
    }
}