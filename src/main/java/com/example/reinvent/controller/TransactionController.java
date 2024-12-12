package com.example.reinvent.controller;

import com.example.reinvent.entity.Transaction;
import com.example.reinvent.repository.TransactionRepository;
import com.example.reinvent.service.CodeGenerators;
import com.example.reinvent.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Transaction>> searchTransactions(@RequestParam String query) {
        return ResponseEntity.ok(transactionService.searchTransactions(query));
    }

    @GetMapping("")
    public ResponseEntity<List<Transaction>> getAllTransections() {
        return ResponseEntity.ok(transactionRepository.findAll());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Transaction>> findByCustomerId(@PathVariable String customerId) {
        return ResponseEntity.ok(transactionService.findByCustomerIdContainingIgnoreCase(customerId));
    }

    @GetMapping("/customer/name/{name}")
    public ResponseEntity<List<Transaction>> findByCustomerName(@PathVariable String name) {
        return ResponseEntity.ok(transactionService.findByCustomerNameContainingIgnoreCase(name));
    }

    @GetMapping("/mobile/{mobile}")
    public ResponseEntity<List<Transaction>> getCustomerByMobile(@PathVariable String mobile) {
        return ResponseEntity.ok(transactionRepository.findByMobile(mobile));
    }

    @GetMapping("/referral/{referralId}")
    public ResponseEntity<List<Transaction>> findByReferralId(@PathVariable String referralId) {
        return ResponseEntity.ok(transactionService.findByReferralIdContainingIgnoreCase(referralId));
    }

    @GetMapping("/customer/{customerId}/transactions")
    public ResponseEntity<List<Transaction>> getCustomerTransactions(@PathVariable String customerId) {
        return ResponseEntity.ok(transactionService.getTransactionsByCustomerId(customerId));
    }

    @GetMapping("/referral/{referralId}/transactions")
    public ResponseEntity<List<Transaction>> getReferralTransactions(@PathVariable String referralId) {
        return ResponseEntity.ok(transactionService.getTransactionsByReferralId(referralId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Transaction>> getTransactionsByDate(@PathVariable String date) {
        return ResponseEntity.ok(transactionService.getTransactionsByDate(date));
    }

    @GetMapping("/referred/{referralId}")
    public ResponseEntity<List<Transaction>> getReferredTransactions(@PathVariable String referralId) {
        return ResponseEntity.ok(transactionService.getTransactionsByReferredCustomerIds(referralId));
    }

    @GetMapping(value = "/generate/customerId", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> generateCustomerId() {
        return ResponseEntity.ok(CodeGenerators.generateNewCustomerId());
    }

    @GetMapping(value = "/generate/referralId", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> generateReferralId() {
        return ResponseEntity.ok(CodeGenerators.generateNewReferralId());
    }

    @PostMapping("")
    public Transaction saveTransaction(@RequestBody Transaction transaction) {
        return transactionService.saveTransaction(transaction);
    }

    @PostMapping("/all")
    public List<Transaction> saveAllTransactions(@RequestBody List<Transaction> transactions) {
        return transactionRepository.saveAll(transactions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> putMethodName(@PathVariable Long id, @RequestBody Transaction entity) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteById(@PathVariable Long id) {

        if (!transactionService.deleteTransaction(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid ID");
        }
        return ResponseEntity.ok("Deleted ID:" + id);
    }

    @DeleteMapping("customer/{id}")
    public ResponseEntity<String> deleteByCustomer(@PathVariable String customerId) {
        if (!transactionService.deleteTransactionsByCustomer(customerId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid Customer Id");
        }
        return ResponseEntity.ok("Deleted All Transections of Customer:" + customerId);
    }
}
