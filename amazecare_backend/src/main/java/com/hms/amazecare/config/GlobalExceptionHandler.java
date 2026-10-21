package com.hms.amazecare.config;

import com.hms.amazecare.dto.response.ErrorDto;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.InvalidDataException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorDto> resourceNotFoundExceptionHandler(ResourceNotFoundException e){
        return ResponseEntity
                .badRequest()
                .body(new ErrorDto(
                        e.getMessage(),
                        "Invalid Id is given",
                        LocalDateTime.now()
                ));

    }
    @ExceptionHandler(InvalidDataException.class)
    public ResponseEntity<ErrorDto> handleInvalidDataException(InvalidDataException e){
        return ResponseEntity
                .badRequest()
                .body(new ErrorDto(
                        e.getMessage(),
                        "Invalid Data is given",
                        LocalDateTime.now()
                ));


    }
    // exception while using @Jsonformat
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorDto> handleUnreadable(HttpMessageNotReadableException e) {
        return ResponseEntity
                .badRequest()
                .body(new ErrorDto(
                        e.getMessage(),
                        "Invalid input. Time must be in 24-hour format",
                        LocalDateTime.now()
                ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDto> handleAccessDeniedException(AccessDeniedException e) {
        return ResponseEntity
                .badRequest()
                .body(new ErrorDto(
                        e.getMessage(),
                        "This User Can't perform this Operation",
                        LocalDateTime.now()
                ));
    }

}
