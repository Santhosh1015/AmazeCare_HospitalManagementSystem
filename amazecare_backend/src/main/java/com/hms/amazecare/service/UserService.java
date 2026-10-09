package com.hms.amazecare.service;

import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User createUser(String email, String password, Role role) {
        User user = new User();
        user.setRole(role);
        user.setEmail(email);
        user.setPassword(password);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }
}
