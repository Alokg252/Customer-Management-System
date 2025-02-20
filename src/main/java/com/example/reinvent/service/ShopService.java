package com.example.reinvent.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.reinvent.entity.Shop;
import com.example.reinvent.repository.ShopRepository;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void saveShop(Shop shop) {
        shop.setPassword(passwordEncoder.encode(shop.getPassword()));
        shopRepository.save(shop);
    }

    public Shop findByUsername(String username) {
        return shopRepository.findByUsername(username);
    }

    public void changeShopName(String name, String username) {
        Shop shop = shopRepository.findByUsername(username);
        if (shop != null) {
            shop.setShopname(name);
            shopRepository.save(shop);
        }
    }

    public void changePassword(String password, String username) {
        Shop shop = shopRepository.findByUsername(username);
        if (shop != null) {
            shop.setPassword(passwordEncoder.encode(password));
            shopRepository.save(shop);
        }
    }

    public void removeShop(String username) {
        Shop shop = shopRepository.findByUsername(username);
        if (shop != null) {
            shopRepository.delete(shop);
        }
    }
}
