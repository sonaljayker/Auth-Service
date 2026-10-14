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
    @Builder.Default
    private boolean enable=true;
    @Builder.Default
    private Instant createdAt= now();
    @Builder.Default
    private Instant updatedAt= now();
    @Builder.Default
    private Provider provider=Provider.LOCAL;
    @Builder.Default
    private Set<RoleDto> roles=new HashSet<>();
}
