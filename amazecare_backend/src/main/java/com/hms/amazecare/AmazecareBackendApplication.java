package com.hms.amazecare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
public class AmazecareBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AmazecareBackendApplication.class, args);
	}

}
