package com.example.reinvent.controller;

import com.example.reinvent.entity.Transaction;
import com.example.reinvent.service.CodeGenerators;
import com.example.reinvent.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/search")
    public ResponseEntity<List<Transaction>> searchTransactions(@RequestParam String query) {
        return ResponseEntity.ok(transactionService.searchTransactions(query));
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
    public ResponseEntity<List<Transaction>> findByMobile(@PathVariable String mobile) {
        return ResponseEntity.ok(transactionService.findByMobileContainingIgnoreCase(mobile));
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
}
