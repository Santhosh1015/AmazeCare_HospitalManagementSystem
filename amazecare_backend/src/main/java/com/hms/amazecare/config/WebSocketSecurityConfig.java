package com.hms.amazecare.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {
    @Bean("csrfChannelInterceptor")
    ChannelInterceptor csrfChannelInterceptor() {
        return new ChannelInterceptor() {};
    }

    @Bean
    AuthorizationManager<Message<?>> messageAuthorizationManager(
            MessageMatcherDelegatingAuthorizationManager.Builder messages) {

        messages
                .simpTypeMatchers(
                        SimpMessageType.CONNECT,
                        SimpMessageType.DISCONNECT,
                        SimpMessageType.OTHER
                ).permitAll()

                .simpDestMatchers("/app/chat.send")
                .authenticated()

                .simpSubscribeDestMatchers(
                        "/user/queue/messages",
                        "/user/queue/errors"
                ).authenticated()

                .anyMessage().denyAll();

        return messages.build();
    }
}
