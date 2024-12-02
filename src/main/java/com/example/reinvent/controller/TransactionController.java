package com.example.reinvent.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.reinvent.entity.Transaction;
import com.example.reinvent.repository.TransactionRepository;
import com.example.reinvent.service.TransactionService;
import java.util.List;

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

    // @PostMapping
    // public Transaction saveTransaction0(@RequestBody Transaction transaction) {
    //     return transactionService.saveTransaction(transaction);
    // }

    @PostMapping
    public Transaction saveTransaction(@RequestBody Transaction transaction) {
        // Check referral constraints
        if (transaction.getReferredCustomerId1() != null && transaction.getReferredCustomerId2() != null) {
            throw new IllegalArgumentException("A customer can refer only two new customers.");
        }
        return transactionService.saveTransaction(transaction);
    }

    @GetMapping("/referrals/{referralId}")
    public List<Transaction> getReferrals(@PathVariable String referralId) {
        return transactionRepository.findByReferredCustomerId1OrReferredCustomerId2(referralId);
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
