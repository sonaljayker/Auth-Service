package com.project.authservice.service;

import com.project.authservice.Exception.ResourceNotFoundException;
import com.project.authservice.dto.UserDto;
import com.project.authservice.entity.Provider;
import com.project.authservice.entity.User;
import com.project.authservice.helper.UserHelper;
import com.project.authservice.repository.UserRepository;
import com.project.authservice.service.Impl.UserServiceImp;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements UserServiceImp {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public UserDto createUser(UserDto userDto) {
        if (userDto.getEmail() == null || userDto.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (userRepository.existsByEmail(userDto.getEmail())){
            throw new IllegalArgumentException("Email already exists");
        }
        User user=modelMapper.map(userDto, User.class);
        user.setProvider(userDto.getProvider() != null ? userDto.getProvider() : Provider.LOCAL);
        User savedUser=userRepository.save(user);
        return modelMapper.map(savedUser, UserDto.class);
    }

    @Override
    public UserDto getUserByEmail(String email) {
       User user= userRepository
               .findByEmail(email)
               .orElseThrow(()->new ResourceNotFoundException("User is not found with given email "));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public UserDto updateUser(UserDto userDto, String userId) {
        UUID uid=UserHelper.parseUUID(userId);
        User ExistingUser=userRepository
                .findById(uid)
                .orElseThrow(()->new ResourceNotFoundException("User is not found with given id "));
        if(userDto.getPassword()!=null) ExistingUser.setPassword(userDto.getPassword());
        if(userDto.getUsername()!=null) ExistingUser.setUsername(userDto.getUsername());
        if (userDto.getProvider()!=null) ExistingUser.setProvider(userDto.getProvider());
        ExistingUser.setEnable(userDto.isEnable());
        User UpdatedUser=userRepository.save(ExistingUser);
        return modelMapper.map(UpdatedUser, UserDto.class);
    }

    @Override
    public void deleteUser(String userId) {
       UUID uid = UserHelper.parseUUID(userId);
       User user=userRepository.findById(uid).orElseThrow(()-> new ResourceNotFoundException("User is not found with given id "));
       userRepository.delete(user);
    }

    @Override
    public UserDto getUserById(String userId) {
       User user= userRepository.findById(UserHelper.parseUUID(userId)).orElseThrow(()->new ResourceNotFoundException("User is not found with given id "));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public Iterable<UserDto> getAllUsers() {
        return userRepository
                .findAll()
                .stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .toList();
    }
}
