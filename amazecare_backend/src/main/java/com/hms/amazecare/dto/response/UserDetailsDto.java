package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;

public record UserDetailsDto(
        String UserEmail,
        Role role,
        UserStatus status

) {
}
