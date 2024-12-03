package com.example.reinvent.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.reinvent.repository.TransactionRepository;
import org.springframework.orm.jpa.JpaSystemException;
import com.example.reinvent.entity.Transaction;
import com.example.reinvent.entity.TransactionDetail;

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

    public Transaction saveTransaction(Transaction transaction) {
        // Generate referral ID: MMYDDA

        String referralId = null;
        try {
            referralId = generateNewReferralId();
        } catch (Exception e) {
            e.getMessage();
        }
        transaction.setReferralId(referralId);
        transaction.setCustomerId("CUST-" + referralId);
        
        System.out.println("\n--------------------------------------------------\n"
        + transaction
        + "\n---------------------------------------------------\n");
        
        System.out.println("\n--------------------------------------------------\n"
        + transaction.getDetails()
        + "\n---------------------------------------------------\n");
        
        try {
            
            // System.out.println("\n--------------------------------------------------\n"
            // + transaction
            // + "\n---------------------------------------------------\n");

            return transactionRepository.save(transaction);
        }

        catch (JpaSystemException e) {
            System.out.println("\n----------------------------------------------------\n");
            System.out.println("is still run...");
            System.out.println(e.getMessage());
            System.out.println("\n----------------------------------------------------\n");
        } catch (Exception e) {
            System.out.println("\n----------------------------------------------------\n");
            System.out.println(e.getClass());
            System.out.println(e.getMessage());
            System.out.println("\n----------------------------------------------------\n");
        }

        return null;
    }

    // Generate unique customer ID (UUID or custom logic)
    public String generateNewReferralId() throws IOException {

        LocalDate today = LocalDate.now();
        int dayOfMonth = today.getDayOfMonth();
        int month = today.getMonthValue();
        int yearLastDigit = today.getYear() % 10;

        String path = "src/main/resources/static/char.txt";

        File file = new File(path);
        Scanner scanner = new Scanner(file);

        char c = '@';
        if (scanner.hasNextLine()) {
            String s = scanner.nextLine();
            int len = s.length();
            String mmydd1 = s.substring(0, len - 1); // fetched referalId month year and Date
            String mmydd2 = String.format("%02d%d%02d", month, yearLastDigit, dayOfMonth); // todays moth year and date

            if (mmydd1.equals(mmydd2)) {
                c = s.charAt(len - 1);
                if (c < 'a' && c >= 'Z')
                    c = 96;
            }
        }
        scanner.close();

        char currentChar = c;
        char nextChar = (char) (currentChar + 1);

        // Generate referral ID: MMYDDA
        String referralId = String.format("%02d%d%02d%c", month, yearLastDigit, dayOfMonth, nextChar);

        FileWriter fileWriter = new FileWriter(path);
        fileWriter.write(referralId);
        fileWriter.close();
        return referralId;
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
