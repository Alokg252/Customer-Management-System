package com.example.reinvent.entity;

import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity
public class TransactionDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productName;
    private int quantity;
    private double amount;
    private double cost;

    @ManyToOne
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;
}
