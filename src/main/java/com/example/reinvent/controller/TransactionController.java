package com.example.reinvent.controller;

import com.example.reinvent.entity.Transaction;
import com.example.reinvent.repository.TransactionRepository;
import com.example.reinvent.service.CodeGenerators;
import com.example.reinvent.service.ReceiptGeneratorService;
import com.example.reinvent.service.TransactionService;

import jakarta.servlet.ServletRequest;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

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

    @GetMapping("/transaction/{id}")
    public ResponseEntity<Transaction> searchTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionRepository.findById(id).get());
    }

    @GetMapping("")
    public ResponseEntity<List<Transaction>> getAllTransections() {
        return ResponseEntity.ok(transactionRepository.findAll());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Transaction>> findByCustomerId(@PathVariable String customerId) {
        return ResponseEntity.ok(transactionService.findByCustomerIdContainingIgnoreCase(customerId));
    }

    /************* ✨ Codeium Command ⭐ *************/
    /****** a1f9040a-5b14-4443-90a2-6fed62b78814 *******/
    @GetMapping("/customer/{customerId}/name")
    public ResponseEntity<String> findNameByCustomerId(@PathVariable String customerId) {
        return ResponseEntity.ok(transactionRepository.findByCustomerId(customerId).get(0).getCustomerName());
    }

    @GetMapping("/referral/{referralId}/name")
    public ResponseEntity<String> findNameByReferralId(@PathVariable String referralId) {
        return ResponseEntity.ok(transactionRepository.findByReferralId(referralId).get(0).getCustomerName());
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
    public ResponseEntity<String> saveTransaction(@RequestBody Transaction transaction) {
        return transactionService.saveTransaction(transaction);
    }

    @PostMapping("/all")
    public List<Transaction> saveAllTransactions(@RequestBody List<Transaction> transactions) {
        return transactionRepository.saveAll(transactions);
    }

    @GetMapping("/excel")
    public byte[] generateExcel() {
        try {
            return transactionService.exportExcel();
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/restore/{id}")
    public String restoreCustomer(@PathVariable Long id) {
        if (transactionService.restoreCustomer(id))
            return "customer restored successfully";
        return "can't restore customer";
    }

    @PostMapping("/check/mobile")
    public String checkMobile(@RequestBody String mobile) {
        if (transactionRepository.findByMobile(mobile).isEmpty())
            return "accepted";
        return ("number already belongs to " + transactionRepository.findByMobile(mobile).get(0).getCustomerName());
    }

    @PostMapping("/check/referrer")
    public String checkReferredByString(@RequestBody String referralId) {
        List<Transaction> referrers = transactionRepository.findByReferralId(referralId);
        if (referrers.isEmpty())
            return "referrer's id doesn't exist";
        else if ((referrers.get(0).getReferredCustomerId1() != null)
                && (referrers.get(0).getReferredCustomerId2() == null))
            return "referrer has already referred a customer can refer one more\n" + "Referral ID belongs to : "
                    + referrers.get(0).getCustomerName();

        else if ((referrers.get(0).getReferredCustomerId1() != null)
                && (referrers.get(0).getReferredCustomerId2() != null))
            return "referrer has already referred two customers can't refer anymore" + "Referral ID belongs to : "
                    + referrers.get(0).getCustomerName();

        return "acceped";
    }

    @PostMapping("/receipt")
    public byte[] generateReceipt(@RequestBody Transaction transaction) {
        try {
            return ReceiptGeneratorService.generateReceipt(transaction);
        } catch (Exception e) {
            return null;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> putMethodName(@PathVariable Long id, @RequestBody Transaction entity) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteById(@PathVariable Long id, HttpServletRequest req) {

        if (!transactionRepository.existsById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid ID");

        Transaction deletedTransaction = transactionService.deleteTransaction(id, req.getHeader("delete"));

        return ResponseEntity.ok("Deleted Customer : " +
                deletedTransaction.getCustomerName() + "\nCustomer ID : " +
                deletedTransaction.getCustomerId() + "\nMobile : " +
                deletedTransaction.getMobile() + "\nReferral ID : " +
                deletedTransaction.getReferralId());

    }

    @DeleteMapping("customer/{id}")
    public ResponseEntity<String> deleteByCustomer(@PathVariable String customerId) {
        if (!transactionService.deleteTransactionsByCustomer(customerId)) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid Customer Id");
        }
        return ResponseEntity.ok("Deleted All Transections of Customer:" + customerId);
    }
}
