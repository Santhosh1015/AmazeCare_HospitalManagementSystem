package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.AdminDto;
import com.hms.amazecare.dto.response.UserDetailsDto;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(String email, String password, Role role) {
        User user = new User();
        user.setRole(role);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    public User getAdminUserByUsername(String adminUsername) {
        return userRepository.findByEmail(adminUsername);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(()->new ResourceNotFoundException("userID is invalid"));

        //softly delete the user with status
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    public UserDetailsDto getUserDetails(String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        return new UserDetailsDto(
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }
}
