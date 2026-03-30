package com.project.authservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static java.time.Instant.now;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    private UUID id;
    private String username;
    private String password;
    private String email;
    private boolean enable=true;
    private Instant createdAt= now();
    private Instant updatedAt= now();
    @Enumerated(EnumType.STRING)
    private Provider provider=Provider.LOCAL;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "roles",joinColumns = @JoinColumn(name = "user_id"),inverseJoinColumns =@JoinColumn(name = "role_id"))
    private Set<Role> roles=new HashSet<>();

    @PrePersist
    protected void onCreated(){
        Instant now= now();
        if (createdAt==null) createdAt=now();
        updatedAt=now;
    }

    @PreUpdate
    protected void onUpdated() {
        updatedAt=now();
    }
}
