package com.hms.amazecare.config;

import com.hms.amazecare.Utility.JwtUtility;
import com.hms.amazecare.service.MyUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StompAuthInterceptor  implements ChannelInterceptor {

    private  final JwtUtility jwtUtility;
    private final MyUserDetailsService myUserDetailsService;
    @Override
//    <?> wildcard generic
    public Message<?> preSend(Message<?> message,
                              MessageChannel channel){
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );
        if (accessor != null &&
                StompCommand.CONNECT.equals(accessor.getCommand())) {

            // 1. Read JWT from STOMP CONNECT headers
            String authorizationHeader =
                    accessor.getFirstNativeHeader("Authorization");

            if (authorizationHeader == null ||
                    !authorizationHeader.startsWith("Bearer ")) {

                throw new IllegalArgumentException(
                        "Missing or invalid Authorization header"
                );
            }

            // 2. Extract token
            String token = authorizationHeader.substring(7);

            // 3. Extract username/email from JWT
            String username = jwtUtility.extractUsername(token);

            // 4. Load active user
            UserDetails userDetails =
                    myUserDetailsService.loadUserByUsername(username);

            // 5. Validate token
            if (!jwtUtility.validateToken(
                    token,
                    userDetails.getUsername())) {

                throw new IllegalArgumentException(
                        "Invalid or expired JWT"
                );
            }

            // 6. Create authenticated principal
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            // 7. Associate authenticated user with STOMP session
            accessor.setUser(authentication);
        }

        System.out.println("STOMP command: " + (accessor != null ? accessor.getCommand() : "null"));
        return message;
    }
}
