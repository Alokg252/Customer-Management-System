package com.example.reinvent.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/css/**", "/js/**").permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/login", "/register").permitAll() // Allow access to login and register pages
                        .requestMatchers("/").authenticated()
                        .requestMatchers("/**").permitAll()
                        .anyRequest().authenticated()) // Ensure other requests are authenticated
                .formLogin(form -> form
                        .loginPage("/login") // Specify custom login page
                        .permitAll())
                .logout(logout -> logout
                        .permitAll());
        return http.build();
    }
}
