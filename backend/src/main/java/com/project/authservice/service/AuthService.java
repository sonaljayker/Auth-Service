package com.project.authservice.service;

import com.project.authservice.dto.UserDto;

import java.util.Map;

public interface AuthService {
    UserDto register(UserDto userDto);
    Map<String, String> login(UserDto userDto);
}
