package com.hms.amazecare.config;

import com.hms.amazecare.service.MyUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.graphql.GraphQlProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.bind.annotation.GetMapping;

import static com.hms.amazecare.enums.Role.DOCTOR;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final MyUserDetailsService myUserDetailsService;

    @Bean
    public SecurityFilterChain defaultFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(authorize->authorize

                            .requestMatchers(HttpMethod.GET, "/api/auth/login").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/auth/user-details").authenticated()
                            // patient APIs
                            .requestMatchers(HttpMethod.GET, "/api/v1/patients/admin/report").hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.GET, "/api/v1/patient/dashboard/summary").hasAuthority("PATIENT")
                            .requestMatchers(HttpMethod.POST,"/api/v1/patient/register").permitAll()
                            .requestMatchers(HttpMethod.POST,"/api/v1/patient/staff-register").hasAnyAuthority("ADMIN" , "EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT , "/api/v1/patient/update/{patientId}").hasAnyAuthority("PATIENT", "ADMIN" , "EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/patient/{patientId}/delete").hasAnyAuthority("ADMIN", "EXECUTIVE")
                            //EXECUTIVE APIs
                            .requestMatchers(HttpMethod.GET, "/api/v1/executive/{executiveId}").hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.GET, "/api/v1/executives/admin/report").hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.GET, "/api/v1/appointments/executive/summary").hasAuthority("EXECUTIVE")
                            .requestMatchers(HttpMethod.POST, "/api/v1/executive/register").hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/executive/{executiveId}/update").hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.PUT,"/api/v1/executive/{executiveId}/delete").hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.GET, "/api/v1/executives").hasAuthority("ADMIN")
                            // ADMIN APIs
                            .requestMatchers(HttpMethod.POST, "/api/v1/admin/add").permitAll()
                            .requestMatchers(HttpMethod.PUT, "/api/v1/admin/{adminId}/delete").denyAll()
                            // Doctor APIs
                            .requestMatchers(HttpMethod.GET , "/api/v1/doctors/dashboard/summary").hasAuthority("DOCTOR")
                            .requestMatchers(HttpMethod.GET ,"/api/v1/doctors/admin/report").hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.POST, "/api/v1/doctor/add").hasAnyAuthority("EXECUTIVE", "ADMIN")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/doctor/{doctorId}/update").hasAnyAuthority("ADMIN", "EXECUTIVE", "DOCTOR")
                            .requestMatchers(HttpMethod.GET, "/api/v1/doctors").hasAnyAuthority("PATIENT", "ADMIN","EXECUTIVE")
                            .requestMatchers(HttpMethod.GET, "/api/v1/doctor/profile").hasAuthority("DOCTOR")
                            .requestMatchers(HttpMethod.GET, "/api/v1/doctor/{doctorId}").hasAnyAuthority("PATIENT", "ADMIN","EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/doctor/{doctorId}/delete").hasAnyAuthority("ADMIN", "EXECUTIVE")
                            .requestMatchers(HttpMethod.GET, "/api/v1/doctor/me/patients").hasAuthority("DOCTOR")

                            //Appointment APIs
                            .requestMatchers(HttpMethod.POST, "/api/v1/appointment/book").hasAuthority("PATIENT")
                            .requestMatchers(HttpMethod.POST, "/api/v2/appointment/book").hasAuthority("PATIENT")
                            .requestMatchers(HttpMethod.GET , "/api/v1/appointments/patient").hasAuthority("PATIENT")
                            .requestMatchers(HttpMethod.GET, "/api/v1/appointments/doctor").hasAuthority("DOCTOR")
                            .requestMatchers(HttpMethod.GET, "/api/v1/appointments/executive").hasAuthority("EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/appointment/assign/{appointmentId}").hasAuthority("EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/appointment/reschedule/{appointmentId}" ).hasAnyAuthority("PATIENT", "ADMIN","EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT,"/api/v1/appointment/cancel/{appointmentId}").hasAnyAuthority("EXECUTIVE","ADMIN","PATIENT","DOCTOR")
                            .requestMatchers(HttpMethod.PUT,"/api/v1/appointment/consultation/{appointmentId}").hasAuthority("DOCTOR")

                            //Availability APIs
                            .requestMatchers(HttpMethod.POST,"/api/v1/doctor/{doctorId}/availability/add").hasAuthority("EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/doctor/{doctorId}/availability/{availabilityId}").hasAuthority("EXECUTIVE")

                            .requestMatchers(HttpMethod.GET, "/api/v1/doctor/patients/{patientId}/medical-records").hasAuthority("DOCTOR")
                            .requestMatchers(HttpMethod.GET,"/api/v1/medical-record/{recordId}").hasAnyAuthority("EXECUTIVE","ADMIN","PATIENT","DOCTOR")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/update/lab-results/{labResultId}").hasAuthority("EXECUTIVE")
                            .requestMatchers(HttpMethod.GET, "/api/v1/medical-record/{recordId}/lab-results").hasAnyAuthority("EXECUTIVE","ADMIN","PATIENT","DOCTOR")

                            .requestMatchers(HttpMethod.GET, "/api/v1/patient/medical-records").hasAuthority("PATIENT")
                            .requestMatchers(HttpMethod.GET, "/api/v1/appointments/{appointmentId}/consultation").hasAuthority("DOCTOR")
                            .requestMatchers(HttpMethod.GET, "/api/v1/appointments/{appointmentId}").hasAnyAuthority("PATIENT", "DOCTOR", "EXECUTIVE", "ADMIN")
                            .requestMatchers(HttpMethod.GET, "/api/v1/appointments/admin") .hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.GET,"/api/v1/patient/profile").hasAuthority("PATIENT")
                            .requestMatchers(HttpMethod.GET  , "/api/v1/patients").hasAnyAuthority("ADMIN" , "EXECUTIVE")
                            .requestMatchers(HttpMethod.GET, "/api/v1/patient/{patientId}").hasAnyAuthority("ADMIN" , "EXECUTIVE")

                            .requestMatchers("/ws/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/chat/doctor/conversations").hasAuthority("DOCTOR")
                            .requestMatchers(HttpMethod.GET, "/api/chat/{conversationId}/messages").hasAnyAuthority("PATIENT", "DOCTOR")
                            .requestMatchers(HttpMethod.GET, "/api/chat/patient/conversations").hasAuthority("PATIENT")
                            .requestMatchers(HttpMethod.GET , "/api/v1/admin/reports/appointments").hasAuthority("ADMIN")
                            .anyRequest().permitAll()
                );
            http.addFilterBefore(jwtFilter , UsernamePasswordAuthenticationFilter.class);
            http.httpBasic(Customizer.withDefaults());
            return http.build();
    }
    @Bean
    public AuthenticationProvider getProvider(){
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider(myUserDetailsService);
        authenticationProvider.setPasswordEncoder(getEncoder());
        return authenticationProvider;
    }
    @Bean
    public PasswordEncoder getEncoder(){
        return new BCryptPasswordEncoder();
    }
}
