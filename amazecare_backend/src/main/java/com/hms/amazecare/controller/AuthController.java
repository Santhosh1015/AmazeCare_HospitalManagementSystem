package com.hms.amazecare.controller;

import com.hms.amazecare.Utility.JwtUtility;
import com.hms.amazecare.dto.response.TokenDto;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final JwtUtility jwtUtility;
    private final UserRepository userRepository;

    @GetMapping("/api/auth/login")
    public TokenDto login(Principal principal){
        User user = userRepository.findByEmail(principal.getName());
        if(user == null || user.getStatus() != UserStatus.ACTIVE){
            throw new ResourceNotFoundException("Inactive User");
        }
        String token = jwtUtility.generateToken(user.getEmail());

        return new TokenDto(
                token,
                jwtUtility.extractExpiration(token),
                LocalDateTime.now().toString()
        );
    }
}
