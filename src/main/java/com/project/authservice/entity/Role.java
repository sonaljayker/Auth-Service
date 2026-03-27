package com.project.authservice.entity;

import jakarta.persistence.Column;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Role {
    private UUID id=UUID.randomUUID();
    @Column(unique = true, nullable = false)
    private String name;
}
