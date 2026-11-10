package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.ExecutiveDto;
import com.hms.amazecare.dto.request.ExecutiveUpdateDto;
import com.hms.amazecare.dto.response.ExecutiveResDto;
import com.hms.amazecare.enums.ExecutiveDesignation;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.model.Executive;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.ExecutiveRepository;
import com.hms.amazecare.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExecutiveServiceTest {

    @Mock
    private ExecutiveRepository executiveRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private ExecutiveService executiveService;

    @Test
    void registerExecutiveTest() {
        String adminUsername = "admin@gmail.com";
        ExecutiveDto dto = new ExecutiveDto("executive@gmail.com", "password1", "name1", "name2", "id", ExecutiveDesignation.HR_EXECUTIVE);

        User executiveUser = new User();
        executiveUser.setEmail(dto.email());
        executiveUser.setRole(Role.EXECUTIVE);
        executiveUser.setStatus(UserStatus.ACTIVE);

        User adminUser = new User();
        adminUser.setEmail(adminUsername);
        adminUser.setRole(Role.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);

        Executive executive = new Executive();
        executive.setEmployeeId(dto.employeeId());
        executive.setFirstName(dto.firstName());
        executive.setLastName(dto.lastName());
        executive.setDesignation(dto.designation());
        executive.setUser(executiveUser);
        executive.setCreatedBy(adminUser);

        when(userService.createUser(dto.email(), dto.password(), Role.EXECUTIVE)).thenReturn(executiveUser);

        when(userService.getAdminUserByUsername(adminUsername)).thenReturn(adminUser);

        when(executiveRepository.save(any(Executive.class))).thenReturn(executive);

        ExecutiveResDto response = executiveService.registerExecutive(dto, adminUsername);

        assertEquals("name1 name2", response.executiveName());
        assertEquals("id", response.employeeId());
        assertEquals(ExecutiveDesignation.HR_EXECUTIVE, response.designation());

        verify(userService, times(1)).createUser(dto.email(), dto.password(), Role.EXECUTIVE);

        verify(userService, times(1)).getAdminUserByUsername(adminUsername);

        verify(executiveRepository, times(1)).save(any(Executive.class));
    }

    @Test
    void updateExecutiveTest() {
        Long executiveId = 1L;
        String adminEmail = "admin@gmail.com";

        User adminUser = new User();
        adminUser.setEmail(adminEmail);
        adminUser.setRole(Role.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);

        User executiveUser = new User();
        executiveUser.setEmail("executive@gmail.com");
        executiveUser.setRole(Role.EXECUTIVE);
        executiveUser.setStatus(UserStatus.ACTIVE);

        Executive executive = new Executive();
        executive.setUser(executiveUser);
        executive.setFirstName("OldName");
        executive.setLastName("OldLastName");
        executive.setEmployeeId("EMP001");
        executive.setDesignation(ExecutiveDesignation.BILLING_EXECUTIVE);

        ExecutiveUpdateDto dto = new ExecutiveUpdateDto("NewName", "NewLastName", "EMP002", ExecutiveDesignation.BILLING_EXECUTIVE);

        when(userRepository.findByEmail(adminEmail)).thenReturn(adminUser);

        when(executiveRepository.findById(executiveId)).thenReturn(Optional.of(executive));

        when(executiveRepository.save(any(Executive.class))).thenReturn(executive);

        ExecutiveResDto response =
                executiveService.updateExecutive(executiveId, adminEmail, dto);

        assertEquals("NewName NewLastName", response.executiveName());
        assertEquals("EMP002", response.employeeId());
        assertEquals(ExecutiveDesignation.BILLING_EXECUTIVE, response.designation());

        verify(userRepository, times(1)).findByEmail(adminEmail);
        verify(executiveRepository, times(1)).findById(executiveId);
        verify(executiveRepository, times(1)).save(executive);

        verifyNoMoreInteractions(userRepository,
                executiveRepository);
    }
    @Test
    void updateExecutive_Invalid() {
        Long executiveId = 1L;
        String userEmail = "executive@gmail.com";

        User user = new User();
        user.setEmail(userEmail);
        user.setRole(Role.EXECUTIVE);
        user.setStatus(UserStatus.ACTIVE);

        ExecutiveUpdateDto dto = new ExecutiveUpdateDto("NewName", "NewLastName", "EMP002", ExecutiveDesignation.BILLING_EXECUTIVE);


        when(userRepository.findByEmail(userEmail)).thenReturn(user);

        assertThrows(AccessDeniedException.class, () -> executiveService.updateExecutive(executiveId, userEmail, dto));

        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(executiveRepository, times(0)).findById(executiveId);
        verify(executiveRepository, times(0)).save(any(Executive.class));

        verifyNoMoreInteractions(userRepository,executiveRepository);
    }

    @Test
    void deleteExecutiveTest() {
        Long executiveId = 1L;
        String userEmail = "admin@gmail.com";

        User executiveUser = new User();
        executiveUser.setId(10L);
        executiveUser.setStatus(UserStatus.ACTIVE);

        Executive executive = new Executive();
        executive.setId(executiveId);
        executive.setUser(executiveUser);

        User adminUser = new User();
        adminUser.setEmail(userEmail);
        adminUser.setRole(Role.ADMIN);

        when(executiveRepository.findById(executiveId)).thenReturn(Optional.of(executive));

        when(userRepository.findByEmail(userEmail)).thenReturn(adminUser);

        executiveService.deleteExecutive(executiveId, userEmail);

        verify(executiveRepository, times(1)).findById(executiveId);
        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(userService, times(1)).deleteUser(10L);
    }
    @Test
    void deleteExecutiveInvalidIdTest() {
        Long executiveId = 1L;
        String userEmail = "admin@gmail.com";

        when(executiveRepository.findById(executiveId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> executiveService.deleteExecutive(executiveId, userEmail));

        verify(executiveRepository, times(1)).findById(executiveId);
        verify(userRepository, never()).findByEmail(anyString());
        verify(userService, never()).deleteUser(anyLong());
    }

    @Test
    void fetchExecutivesTest() {
        Executive executive = new Executive();
        executive.setFirstName("name1");
        executive.setLastName("name2");
        executive.setEmployeeId("id1");

        Pageable pageable = PageRequest.of(0, 10);

        when(executiveRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(executive)));

        Page<ExecutiveResDto> result =
                executiveService.fetchExecutives(0, 10);

        assertEquals(1, result.getContent().size());
        assertEquals("name1 name2", result.getContent().getFirst().executiveName());
        assertEquals("id1", result.getContent().getFirst().employeeId());

        verify(executiveRepository, times(1)).findAll(pageable);
    }


}
