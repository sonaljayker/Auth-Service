package com.project.authservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
public class SecurityConfig {

//    @Bean
//    public UserDetailsService userDetailsService() {
//        User.UserBuilder userBuilder = User.withDefaultPasswordEncoder();
//        UserDetails user1=userBuilder.username("sonal").password("admin").roles("ADMIN").build();
//        UserDetails user2=userBuilder.username("shiva").password("user").roles("ADMIN").build();
//        UserDetails user3=userBuilder.username("sunny").password("admin").roles("USER").build();
//        return new InMemoryUserDetailsManager(user1,user2,user3);
//    }
}
