package com.example.reinvent.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class Shop {
    @Id
    int id;
    @Column(nullable = false)
    String username, password, shopname;
}
