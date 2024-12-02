package com.example.reinvent.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.reinvent.repository.TransactionRepository;
import java.util.concurrent.atomic.AtomicInteger;
import com.example.reinvent.entity.Transaction;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    private final AtomicInteger dailyCustomerCount = new AtomicInteger(0); // Reset daily

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getTransactionsByCustomerName(String customerName) {
        return transactionRepository.findByCustomerName(customerName);
    }

    public List<Transaction> getTransactionsByCustomerId(String customerId) {
        return transactionRepository.findByCustomerId(customerId);
    }

    public List<Transaction> getTransactionsByDate(String date) {
        return transactionRepository.findByDate(date);
    }

    public Transaction saveTransaction(Transaction transaction) {
        LocalDate today = LocalDate.now();
        int dayOfMonth = today.getDayOfMonth();
        int month = today.getMonthValue();
        int yearLastDigit = today.getYear() % 10;

        // Generate referral ID: MMYDDA
        char dailyAlpha = (char) ('A' + dailyCustomerCount.getAndIncrement());
        String referralId = String.format("%02d%d%02d%c", month, yearLastDigit, dayOfMonth, dailyAlpha);
        transaction.setReferralId(referralId);

        // Generate unique customer ID (UUID or custom logic)
        transaction.setCustomerId("CUST-" + referralId);

        return transactionRepository.save(transaction);
    }

    public void validateReferrals(Transaction transaction) {
        if (transaction.getReferredCustomerId1() != null && transaction.getReferredCustomerId2() != null) {
            Transaction referrer = transactionRepository.findByCustomerId(transaction.getReferredCustomerId1()).get(0);
            if (referrer != null && (referrer.getReferredCustomerId1() != null && referrer.getReferredCustomerId2() != null)) {
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
