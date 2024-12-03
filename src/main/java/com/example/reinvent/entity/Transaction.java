package com.example.reinvent.entity;

import jakarta.persistence.*;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "transactions") // Changed from 'transaction' to avoid SQLite keyword
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private String customerId; // Auto-generated
    private String referralId; // Unique referral format MMYDDA
    private String referredBy; // referred customerId
    private String referredCustomerId1; // First referred customer
    private String referredCustomerId2; // Second referred customer
    private String date;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL)
    private List<TransactionDetail> details;
}
