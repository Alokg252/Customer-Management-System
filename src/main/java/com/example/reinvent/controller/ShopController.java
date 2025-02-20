package com.example.reinvent.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.reinvent.entity.Shop;
import com.example.reinvent.service.ShopService;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    @Autowired
    ShopService shopService;

    @PostMapping("/save")
    public ResponseEntity<String> saveShop(@RequestBody Shop shop) {
        shopService.saveShop(shop);
        return ResponseEntity.ok("Shop saved successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerShop(@RequestBody Shop shop) {
        shopService.saveShop(shop);
        return ResponseEntity.ok("Shop registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginShop(@RequestParam String username, @RequestParam String password) {
        Shop shop = shopService.findByUsername(username);
        if (shop != null && shop.getPassword().equals(password)) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }

    @PutMapping("/updateName")
    public ResponseEntity<String> updateShopName(@RequestParam String username, @RequestParam String name) {
        shopService.changeShopName(name, username);
        return ResponseEntity.ok("Shop name updated successfully");
    }

    @PutMapping("/updatePassword")
    public ResponseEntity<String> updatePassword(@RequestParam String username, @RequestParam String password) {
        shopService.changePassword(password, username);
        return ResponseEntity.ok("Password updated successfully");
    }

    @GetMapping("/getName")
    public ResponseEntity<String> getShopName(@RequestParam String username) {
        Shop shop = shopService.findByUsername(username);
        if (shop != null) {
            return ResponseEntity.ok(shop.getShopname());
        } else {
            return ResponseEntity.status(404).body("Shop not found");
        }
    }
}