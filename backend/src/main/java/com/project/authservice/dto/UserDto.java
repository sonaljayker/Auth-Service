package com.project.authservice.dto;

import com.project.authservice.entity.Provider;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.*;
import static java.time.Instant.now;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {
    private UUID id;
    private String username;
    private String password;
    private String email;
    private boolean enable=true;
    private Instant createdAt= now();
    private Instant updatedAt= now();
    private Provider provider=Provider.LOCAL;
    private Set<RoleDto> roles=new HashSet<>();
}
