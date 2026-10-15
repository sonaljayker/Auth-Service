package com.project.authservice.service.Impl;

import com.project.authservice.dto.UserDto;

public interface UserServiceImp {

    UserDto createUser(UserDto userDto);

    UserDto getUserByEmail(String email);

    UserDto updateUser(UserDto userDto,String userId);

    void deleteUser(String userId);
    UserDto getUserById(String userId);
    Iterable<UserDto> getAllUsers();
}
