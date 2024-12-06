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

    private String mobile;

    private String referredBy;

    private String referredCustomerId1;

    private String referredCustomerId2;
    
    private String joinedDate;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "transaction_id")
    private List<TransactionDetail> details = new ArrayList<>();

    public void setDetails(List<TransactionDetail> details) {
        if (this.details == null) {
            this.details = new ArrayList<>();
        }
        this.details.clear();
        if (details != null) {
            this.details.addAll(details);
        }
    }

    public List<TransactionDetail> getDetails() {
        if (this.details == null) {
            this.details = new ArrayList<>();
        }
        return this.details;
    }
}
