package com.project.authservice.service.Impl;

import com.project.authservice.dto.UserDto;
import com.project.authservice.service.AuthService;
import com.project.authservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImp implements AuthService {

    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDto register(UserDto userDto) {
        //logic
        //verify email
        //verify password
        //roles
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        UserDto userDto1=userService.createUser(userDto);
        return userDto1;
    }

}
