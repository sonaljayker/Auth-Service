package com.project.authservice.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoleDto {
    private UUID id;
    private String name;
}
