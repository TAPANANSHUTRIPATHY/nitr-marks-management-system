package com.nitrourkela.marks.security;

import com.nitrourkela.marks.model.entity.Faculty;
import com.nitrourkela.marks.model.enums.GlobalRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

public class UserPrincipal implements UserDetails {
    private final UUID id;
    private final String employeeId;
    private final String name;
    private final String email;
    private final String password;
    private final GlobalRole globalRole;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String employeeId, String name, String email, String password, GlobalRole globalRole,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.employeeId = employeeId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.globalRole = globalRole;
        this.authorities = authorities;
    }

    public static UserPrincipal create(Faculty faculty) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + faculty.getGlobalRole().name());
        return new UserPrincipal(
                faculty.getId(),
                faculty.getEmployeeId(),
                faculty.getName(),
                faculty.getEmail(),
                faculty.getPasswordHash(),
                faculty.getGlobalRole(),
                Collections.singletonList(authority)
        );
    }

    public UUID getId() { return id; }
    public String getEmployeeId() { return employeeId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public GlobalRole getGlobalRole() { return globalRole; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return email; } // Use email as username

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
