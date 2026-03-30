package com.project.authservice.service;

import com.project.authservice.dto.UserDto;

public interface UserServiceImp {


    UserDto createUser(UserDto userDto);

    UserDto getUserByEmail(String email);

    UserDto updateUser(UserDto userDto,String userId);

    UserDto deleteUser(String userId);

    Iterable<UserDto> getAllUsers();
}
