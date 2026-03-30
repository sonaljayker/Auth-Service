package com.project.authservice.service;

import com.project.authservice.dto.UserDto;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserServiceImp {

    @Override
    public UserDto createUser(UserDto userDto) {
        return null;
    }

    @Override
    public UserDto getUserByEmail(String email) {
        return null;
    }

    @Override
    public UserDto updateUser(UserDto userDto, String userId) {
        return null;
    }

    @Override
    public UserDto deleteUser(String userId) {
        return null;
    }

    @Override
    public Iterable<UserDto> getAllUsers() {
        return null;
    }
}
