package com.project.authservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static java.time.Instant.now;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name="users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
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
    @Enumerated(EnumType.STRING)
    private Provider provider=Provider.LOCAL;

    @Builder.Default
    private boolean twoFactorEnabled = false;

    private String twoFactorSecret;

    private String phoneNumber;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "roles",joinColumns = @JoinColumn(name = "user_id"),inverseJoinColumns =@JoinColumn(name = "role_id"))
    private Set<Role> roles=new HashSet<>();

    @PrePersist
    protected void onCreated(){
        Instant now= now();
        if (createdAt==null) createdAt=now;
        updatedAt=now;
    }

    @PreUpdate
    protected void onUpdated() {
        updatedAt=now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return (this.username != null && !this.username.isBlank()) ? this.username : this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enable;
    }
}
