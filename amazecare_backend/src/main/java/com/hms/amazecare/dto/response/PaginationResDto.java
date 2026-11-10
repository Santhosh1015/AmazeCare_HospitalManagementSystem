package com.hms.amazecare.dto.response;

public record PaginationResDto(
        int totalPages,
        Long totalElements,
        int noOfElePerPage
) {
}
