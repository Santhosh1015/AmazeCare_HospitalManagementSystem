package com.hms.amazecare.repository;

import com.hms.amazecare.dto.request.AdminDto;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.security.core.userdetails.UserDetails;

public interface UserRepository extends JpaRepository<User, Long> {


    @Query("""
            select u
            from User u
            where email = ?1 and status = ?2
            """)
    UserDetails loadUserByUsername(String userEmail, UserStatus userStatus);



    User findByEmail(String userEmail);

}
