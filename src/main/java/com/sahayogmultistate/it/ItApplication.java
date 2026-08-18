package com.sahayogmultistate.it;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@EnableTransactionManagement
@SpringBootApplication

public class ItApplication {

    public static void main(String[] args) {
        SpringApplication.run(ItApplication.class, args);

        System.out.println(new BCryptPasswordEncoder().encode("password123"));
    }

}
