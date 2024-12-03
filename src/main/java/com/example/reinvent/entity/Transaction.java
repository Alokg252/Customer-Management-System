package com.example.reinvent.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * 
 */
@Data
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String customerName;
    private String customerId;
    private String referralId;
    private String referredCustomerId1;
    private String referredCustomerId2;
    private String date;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "transaction_id") // This is the foreign key in TransactionDetail table
    private List<TransactionDetail> details = new ArrayList<>();

    // Helper method to add details
    public void addDetail(TransactionDetail detail) {
        details.add(detail);
    }

    // Helper method to remove details
    public void removeDetail(TransactionDetail detail) {
        details.remove(detail);
    }
}
