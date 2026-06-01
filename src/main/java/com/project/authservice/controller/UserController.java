package com.project.authservice.controller;

import com.project.authservice.dto.UserDto;
import com.project.authservice.service.Impl.UserServiceImp;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserServiceImp userServiceImp;

    //to create users
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userServiceImp.createUser(userDto));
    }

    //to get all users
    @GetMapping
    public ResponseEntity<Iterable<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userServiceImp.getAllUsers());
    }

    //to fetch user data
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userServiceImp.getUserByEmail(email));
    }

    //to update user data
    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(@RequestBody UserDto userDto,@PathVariable ("userId") String userId) {
        return ResponseEntity.ok(userServiceImp.updateUser(userDto,userId));
    }

    //to delete user data
    @DeleteMapping("/{userId}")
    public void deleteUser(@PathVariable String userId) {
        userServiceImp.deleteUser(userId);
    }

    //to get User by userId
    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(userServiceImp.getUserById(userId));
    }
}
