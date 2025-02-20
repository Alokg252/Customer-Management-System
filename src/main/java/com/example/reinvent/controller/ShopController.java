package com.example.reinvent.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.reinvent.entity.Shop;
import com.example.reinvent.service.ShopService;
import lombok.Data;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    @Autowired
    ShopService shopService;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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
    public ResponseEntity<String> loginShop(@RequestBody ShopCreds creds) {
        Shop shop = shopService.findByUsername(creds.getUsername());
        if (shop != null && passwordEncoder.matches(creds.getPassword(), shop.getPassword())) {
            return ResponseEntity.ok(shop.getShopname());
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }

    @PutMapping("/updateName")
    public ResponseEntity<String> updateShopName(@RequestBody ShopCreds creds) {
        shopService.changeShopName(creds.getShopname(), creds.getUsername());
        return ResponseEntity.ok("Shop name updated successfully");
    }

    @PutMapping("/updatePassword")
    public ResponseEntity<String> updatePassword(@RequestBody ShopCreds creds) {
        shopService.changePassword(creds.getPassword(), creds.getUsername());
        return ResponseEntity.ok("Password updated successfully");
    }

    @GetMapping("/getName")
    public ResponseEntity<String> getShopName(@RequestBody ShopCreds creds) {
        Shop shop = shopService.findByUsername(creds.getUsername());
        if (shop != null) {
            return ResponseEntity.ok(shop.getShopname());
        } else {
            return ResponseEntity.status(404).body("Shop not found");
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> removeShop(@RequestBody ShopCreds creds) {
        Shop shop = shopService.findByUsername(creds.getUsername());
        if (shop != null && passwordEncoder.matches(creds.getPassword(), shop.getPassword())) {
            shopService.removeShop(creds.getUsername());
            return ResponseEntity.ok("Shop removed successfully");
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }

}

@Data
class ShopCreds {
    String username, password, shopname;
}