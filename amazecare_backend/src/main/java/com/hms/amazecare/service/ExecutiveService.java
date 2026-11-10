package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.ExecutiveDto;
import com.hms.amazecare.dto.request.ExecutiveUpdateDto;
import com.hms.amazecare.dto.response.ExecutiveDetailsResDto;
import com.hms.amazecare.dto.response.ExecutiveReportDto;
import com.hms.amazecare.dto.response.ExecutiveResDto;
import com.hms.amazecare.dto.response.PaginationResDto;
import com.hms.amazecare.enums.ExecutiveDesignation;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.ExecutiveMapper;
import com.hms.amazecare.model.Executive;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.ExecutiveRepository;
import com.hms.amazecare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutiveService {

    private final ExecutiveRepository executiveRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public ExecutiveResDto registerExecutive(ExecutiveDto executiveDto , String adminUsername) {
        // prepare user object
        User user = userService.createUser(
                executiveDto.email(),
                executiveDto.password(),
                Role.EXECUTIVE
        );

        User adminUser = userService.getAdminUserByUsername(adminUsername);

        Executive executive = ExecutiveMapper.convertDtoIntoEntity(executiveDto);

        executive.setUser(user);
        // set admin as the user who create executive
        executive.setCreatedBy(adminUser);

        Executive saved = executiveRepository.save(executive);

        log.info("Executive registered successfully with ID: {}", saved.getEmployeeId());
        return ExecutiveMapper.convertEntityToDto(saved);

    }

    public ExecutiveResDto updateExecutive(Long executiveId, String adminEmail, ExecutiveUpdateDto executiveDto) {
       // get the user
        User user = userRepository.findByEmail(adminEmail);
        // authorize the operation by role
        if(user.getRole() != Role.ADMIN){
            throw new AccessDeniedException("Admin can only update Executive's data");
        }
        // check existence
        Executive executive = executiveRepository.findById(executiveId)
                .orElseThrow(()-> new ResourceNotFoundException("Invalid Executive ID"));
        if(executive.getUser().getStatus() != UserStatus.ACTIVE){
            throw new AccessDeniedException("User Status is Inactive");
        }
        // set the updated fields
        executive.setFirstName(executiveDto.firstName());
        executive.setLastName(executiveDto.lastName());
        executive.setEmployeeId(executiveDto.employeeId());
        executive.setDesignation(executiveDto.designation());
        executive.getUser().setUpdatedBy(user);

        Executive saved = executiveRepository.save(executive);
        log.info("Executive updated successfully with ID: {}", executiveId);
        return ExecutiveMapper.convertEntityToDto(saved);

    }

    public void deleteExecutive(Long executiveId, String userEmail) {
        Executive executive = executiveRepository.findById(executiveId)
                .orElseThrow(()-> new ResourceNotFoundException("Executive Id is invalid"));
        if(executive.getUser().getStatus() != UserStatus.ACTIVE){
            throw new AccessDeniedException("User is already Inactive");
        }

        User user = userRepository.findByEmail(userEmail);
        if(user.getRole() != Role.ADMIN ){
            log.warn("Unauthorized user attempted to delete executive");
            throw new AccessDeniedException("ADMIN can only delete Doctor");
        }

        // call the delete method in user service
        userService.deleteUser(executive.getUser().getId());
        log.info("Executive deleted successfully with ID: {}", executiveId);
    }

    public Page<ExecutiveResDto> fetchExecutives(Integer page, Integer size) {

        Pageable pageable = PageRequest.of(page,size);

        Page<Executive> executivePage = executiveRepository.findAllActiveExecutives(pageable);

        return executivePage.map(ExecutiveMapper::convertEntityToDto);

    }

    public ExecutiveReportDto getExecutiveReport(ExecutiveDesignation designation, LocalDate fromDate, LocalDate toDate, Integer page, Integer size) {

        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("From date cannot be after to date");
        }
        Pageable pageable = PageRequest.of(page, size);

        LocalDateTime startDate = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime endDate = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Page<ExecutiveResDto> executivePage = executiveRepository.getExecutiveReport(designation,startDate, endDate, pageable);

        List<ExecutiveResDto> executives = executivePage.getContent();
        PaginationResDto paginationResDto = new PaginationResDto(executivePage.getTotalPages(), executivePage.getTotalElements(), executives.size());

        return new ExecutiveReportDto(executives, paginationResDto);
    }

    public ExecutiveDetailsResDto fetchExecutive(Long executiveId) {
        Executive executive = executiveRepository.findById(executiveId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Executive not found"));

        return new ExecutiveDetailsResDto(
                executive.getUser().getEmail(),
                executive.getFirstName(),
                executive.getLastName(),
                executive.getEmployeeId(),
                executive.getDesignation()
        );
    }
}
