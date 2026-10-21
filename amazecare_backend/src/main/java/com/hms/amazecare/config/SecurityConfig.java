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

                            // patient APIs
                            .requestMatchers(HttpMethod.POST,"/api/v1/patient/register").permitAll()
                            .requestMatchers(HttpMethod.POST,"/api/v1/patient/staff-register").hasAnyAuthority("ADMIN" , "EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT , "/api/v1/patient/update/{patientId}").hasAnyAuthority("PATIENT", "ADMIN" , "EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/patient/{patientId}/delete").hasAnyAuthority("ADMIN", "EXECUTIVE")
                            //EXECUTIVE APIs
                            .requestMatchers(HttpMethod.POST, "/api/v1/executive/register").hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/executive/{executiveId}/update").hasAuthority("ADMIN")
                            .requestMatchers(HttpMethod.PUT,"/api/v1/executive/{executiveId}/delete").hasAuthority("ADMIN")
                            // ADMIN APIs
                            .requestMatchers(HttpMethod.POST, "/api/v1/admin/add").permitAll()
                            .requestMatchers(HttpMethod.PUT, "/api/v1/admin/{adminId}/delete/").denyAll()
                            // Doctor APIs
                            .requestMatchers(HttpMethod.POST, "/api/v1/doctor/add").hasAuthority("EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/doctor/{doctorId}/update").hasAnyAuthority("ADMIN", "EXECUTIVE")
                            .requestMatchers(HttpMethod.GET, "/api/v1/doctors").hasAnyAuthority("PATIENT", "ADMIN","EXECUTIVE")
                            .requestMatchers(HttpMethod.GET, "/api/v1/doctors/{doctorId}").hasAnyAuthority("PATIENT", "ADMIN","EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/doctor/{doctorId}/delete").hasAnyAuthority("ADMIN", "EXECUTIVE")
                            //Appointment APIs
                            .requestMatchers(HttpMethod.POST, "/api/v1/appointment/book").hasAuthority("PATIENT")
                            .requestMatchers(HttpMethod.GET , "/api/v1/appointments/patient").hasAuthority("PATIENT")
                            .requestMatchers(HttpMethod.GET, "/api/v1/appointments/doctor").hasAuthority("DOCTOR")
                            .requestMatchers(HttpMethod.GET, "/api/v1/appointments/executive").hasAuthority("EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/appointment/assign/{appointmentId}").hasAuthority("EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/appointment/reschedule/{appointmentId}" ).hasAnyAuthority("PATIENT", "ADMIN","EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT,"/api/v1/appointment/cancel/{appointmentId}").permitAll()
                            .requestMatchers(HttpMethod.PUT,"/api/v1/appointment/consultation/{appointmentId}").hasAuthority("DOCTOR")

                            //Availability APIs
                            .requestMatchers(HttpMethod.POST,"/api/v1/doctor/{doctorId}/availability/add").hasAuthority("EXECUTIVE")
                            .requestMatchers(HttpMethod.PUT, "/api/v1/doctor/{doctorId}/availability/{availabilityId}").hasAuthority("EXECUTIVE")

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
