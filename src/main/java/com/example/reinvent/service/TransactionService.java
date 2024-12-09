package com.example.reinvent.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.reinvent.repository.TransactionRepository;
import org.springframework.orm.jpa.JpaSystemException;
import com.example.reinvent.entity.Transaction;

import org.springframework.stereotype.Service;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

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
        return transactionRepository.searchTransactions(customerReferralId);    
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
        } catch (Exception e) {
            System.out.println("\n-----------------------------------------------\n");
            System.out.println(e.getClass());
            System.out.println(e.getMessage());
            System.out.println("\n-----------------------------------------------\n");
        }

        return null;
    }

    // Generate unique customer ID (UUID or custom logic)
    

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
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new IllegalArgumentException("Transaction not found with ID: " + id);
        }
        transactionRepository.deleteById(id);
    }

    // Delete all transactions for a specific customer
    public void deleteTransactionsByCustomer(String customerId) {
        List<Transaction> transactions = transactionRepository.findByCustomerId(customerId);
        if (transactions.isEmpty()) {
            throw new IllegalArgumentException("No transactions found for customer ID: " + customerId);
        }
        transactionRepository.deleteAll(transactions);
    }
}
