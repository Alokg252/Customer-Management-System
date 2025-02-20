package com.example.reinvent.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.reinvent.entity.Shop;
import com.example.reinvent.repository.ShopRepository;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    public void saveShop(Shop shop) {
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
            shop.setPassword(password);
            shopRepository.save(shop);
        }
    }
}
