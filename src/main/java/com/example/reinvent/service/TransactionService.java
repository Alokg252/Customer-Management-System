package com.example.reinvent.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.reinvent.repository.TransactionDetailRepository;
import com.example.reinvent.repository.TransactionRepository;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.reinvent.entity.Transaction;
import com.example.reinvent.entity.TransactionDetail;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

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
    // ------------------- Ignore Cases --------------------

    public List<Transaction> searchTransactions(String query) {
        return transactionRepository.searchTransactions(query);
    }

    public List<Transaction> findByCustomerIdContainingIgnoreCase(String customerId) {
        return transactionRepository.findByCustomerIdContainingIgnoreCase(customerId);
    }

    public List<Transaction> findByCustomerNameContainingIgnoreCase(String customerName) {
        return transactionRepository.findByCustomerNameContainingIgnoreCase(customerName);
    }

    public List<Transaction> findByMobileContainingIgnoreCase(String customerMobile) {
        return transactionRepository.findByMobileContainingIgnoreCase(customerMobile);
    }

    public List<Transaction> findByReferralIdContainingIgnoreCase(String customerReferralId) {
        return transactionRepository.findByReferralIdContainingIgnoreCase(customerReferralId);
    }

    // -------------------------------------------------

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

    public ResponseEntity<String> saveTransaction(Transaction transaction) {

        // set product dates
        transaction.getDetails().forEach(detail -> detail.setDate(transaction.getDate()));

        // check mobile
        if (!transactionRepository.findByMobile(transaction.getMobile()).isEmpty()
                && !(transactionRepository.findByMobile(transaction.getMobile()).get(0).getCustomerId().toString()
                        .equals(transaction.getCustomerId().toString()))) {
            String msg = "customer with this number already exists\nthis number belongs to "
                    + transactionRepository.findByMobile(transaction.getMobile()).get(0).getCustomerName().toString();
            System.out.println(msg);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);
        }

        // unique refferal
        if (!(transactionRepository.findByReferralIdContainingIgnoreCase(transaction.getReferralId())).isEmpty()) {
            if (!transactionRepository.findByReferralIdContainingIgnoreCase(transaction.getReferralId().toString())
                    .get(0).getCustomerId().toString().equals(transaction.getCustomerId().toString())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("this refferal id already belongs to " + transactionRepository
                                .findByReferralIdContainingIgnoreCase(transaction.getReferralId()).get(0)
                                .getCustomerName().toString());
            }
        }

        // check and set refferal
        if (transaction.getReferredBy() != null) {
            List<Transaction> reffered = transactionRepository.findByReferralId(transaction.getReferredBy());
            if (reffered.isEmpty()) {
                String s = "refferal customer doesn't exist";
                System.out.println(s);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(s);
            }
            Transaction refferie = reffered.get(0);

            // checking if referrie has already referred this customer;
            if (!((Objects.requireNonNullElse(refferie.getReferredCustomerId1(), ""))
                    .toString().equals(transaction.getCustomerId().toString()))
                    && !((Objects.requireNonNullElse(refferie.getReferredCustomerId2(), ""))
                            .toString().equals(transaction.getCustomerId().toString()))

            ) {

                // setting referred customers id to referrie's referred places
                if (refferie.getReferredCustomerId1() == null) {
                    refferie.setReferredCustomerId1(transaction.getCustomerId());
                } else if (refferie.getReferredCustomerId2() == null) {
                    refferie.setReferredCustomerId2(transaction.getCustomerId());
                } else {
                    String s = "user has already reffered 2 customers";
                    System.out.println(s);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(s);
                }
            }
        }

        if (transaction.getId() != null) {
            Transaction customer = transactionRepository.findById(transaction.getId()).get();
            customer.getDetails().addAll(transaction.getDetails());
            transaction.setDetails(customer.getDetails());
            transaction.setTotalAmount(customer.getTotalAmount() + transaction.getTotalAmount());
            transaction.setTotalCost(customer.getTotalCost() + transaction.getTotalCost());
            transaction.setOccurance(Objects.requireNonNullElse(customer.getOccurance(), 0) + 1);
            transactionRepository.save(transaction);
            return ResponseEntity.ok("added new transaction");
        }

        // setting default occurance for new customer
        transaction.setOccurance(1);

        // saving and handling errors
        try {
            return ResponseEntity.ok(transactionRepository.save(transaction) + "");
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
        String s = "error creating transaction";
        System.out.println(s);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(s);

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

    public List<TransactionDetail> TransactionDetailsByTransaction(String customerId) {
        List<Transaction> transactions = transactionRepository.findByCustomerId(customerId);
        if (transactions.isEmpty()) {
            return null;
        }
        return transactionDetailRepository.findByTransactions(transactions.get(0));
    }

    public byte[] exportExcel(){
        return ExcelExportService.exportUserDataToExcel(transactionRepository.findAll());
    }
}