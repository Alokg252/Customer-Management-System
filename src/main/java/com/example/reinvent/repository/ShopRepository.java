package com.example.reinvent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.reinvent.entity.Shop;

public interface ShopRepository extends JpaRepository<Shop, Integer> {
    Shop findByUsername(String username);
}
