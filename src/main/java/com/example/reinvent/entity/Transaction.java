package com.example.reinvent.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;


@Data
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;

    @Column(nullable = false)
    private String customerId;

    @Column(nullable = true)
    private String mobile;

    @Column(nullable = true)
    private String referralId;

    @Column(nullable = true)
    private String referredBy;

    @Column(nullable = true)
    private String referredCustomerId1;

    @Column(nullable = true)
    private String referredCustomerId2;

    private String date;

    private double totalAmount;
    private double totalCost;
    private int occurance;
    private Boolean deleted = false;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "transaction_id", nullable = false) // This is the foreign key in TransactionDetail table
    private List<TransactionDetail> details = new ArrayList<>();

    // Helper method to add details
    public void addDetail(TransactionDetail detail) {
        details.add(detail);
    }

    // Helper method to remove details
    public void removeDetail(TransactionDetail detail) {
        details.remove(detail);
    }

    // Helper method to update details
    public void updateDetails(List<TransactionDetail> newDetails) {
        this.details.clear();
        if (newDetails != null) {
            this.details.addAll(newDetails);
        }
    }
}

/*
 * <--COMMANDS-->
 * nohup java -jar app.jar &
 * __
 * ps aux | grep app.jar
 * kill -9 <PID>
 * 
 * 
 * <-- with tmux -->
 * sudo yum install tmux
 * tmux new -s mySpringBootApp
 * java -jar app.jar
 * __
 * tmux attach -t mySpringBootApp
 * ctrl+c
 */

//  ssh -i "cms.pem" ec2-user@ec2-34-226-213-244.compute-1.amazonaws.com