package com.hms.amazecare.repository;

import com.hms.amazecare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
