package com.example.reinvent.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.reinvent.entity.Transaction;
import com.example.reinvent.repository.TransactionRepository;
import com.example.reinvent.service.TransactionService;
import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    @GetMapping("/newreferralid")
    public String getNewReferralId() {
        return transactionService.generateNewReferralId();
    }

    @GetMapping("/customer/name/{name}")
    public List<Transaction> getTransactionsByCustomerName(@PathVariable String name) {
        return transactionService.getTransactionsByCustomerName(name);
    }

    @GetMapping("/customer/id/{id}")
    public List<Transaction> getTransactionsByCustomerId(@PathVariable String id) {
        return transactionService.getTransactionsByCustomerId(id);
    }

    @GetMapping("/date/{date}")
    public List<Transaction> getTransactionsByDate(@PathVariable String date) {
        return transactionService.getTransactionsByDate(date);
    }

    @GetMapping("/referred1/{customerId}")
    public List<Transaction> getTransactionsByReferredCustomerId1(
            @PathVariable String customerId) {
        return transactionService.getTransactionsByReferredCustomerId1(customerId);
    }

    @GetMapping("/referred2/{customerId}")
    public List<Transaction> getTransactionsByReferredCustomerId2(
            @PathVariable String customerId) {
        return transactionService.getTransactionsByReferredCustomerId2(customerId);
    }

    @GetMapping("/referralid/{referralId}")
    public List<Transaction> getTransactionsByReferralId(
            @PathVariable String referralId) {
        return transactionService.getTransactionsByReferralId(referralId);
    }
    
    @GetMapping("/referrals/{referralId}")
    public List<Transaction> getReferrals(@PathVariable String referralId) {
        return transactionRepository.findByReferredCustomerId1OrReferredCustomerId2(referralId);
    }

    @PostMapping
    public Transaction saveTransaction(@RequestBody Transaction transaction) {
        // Check referral constraints
        // if (transaction.getReferredCustomerId1() != null && transaction.getReferredCustomerId2() != null) {
        //     throw new IllegalArgumentException("A customer can refer only two new customers.");
        // }
        return transactionService.saveTransaction(transaction);
    }

    @PostMapping("/all")
    public List<Transaction> saveAllTransaction(@RequestBody List<Transaction> transactions) {
        return transactionRepository.saveAll(transactions);
    }
    
    // Update transaction (including customer info)
    @PutMapping("/{id}")
    public Transaction updateTransaction(@PathVariable Long id, @RequestBody Transaction updatedTransaction) {
        return transactionService.updateTransaction(id, updatedTransaction);
    }

    // Delete a transaction
    @DeleteMapping("/{id}")
    public String deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return "Transaction with ID " + id + " deleted successfully.";
    }

    // Delete all transactions of a specific customer
    @DeleteMapping("/customer/{customerId}")
    public String deleteTransactionsByCustomer(@PathVariable String customerId) {
        transactionService.deleteTransactionsByCustomer(customerId);
        return "All transactions for customer ID " + customerId + " deleted successfully.";
    }
}
