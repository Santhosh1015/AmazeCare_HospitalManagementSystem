package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.ExecutiveDto;
import com.hms.amazecare.dto.response.ExecutiveResDto;
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
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
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

        return ExecutiveMapper.convertEntityToDto(saved);

    }

    public ExecutiveResDto updateExecutive(Long executiveId, String adminEmail, ExecutiveDto executiveDto) {
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
            throw new AccessDeniedException("ADMIN can only delete Doctor");
        }

        // call the delete method in user service
        userService.deleteUser(executive.getUser().getId());
    }
}
