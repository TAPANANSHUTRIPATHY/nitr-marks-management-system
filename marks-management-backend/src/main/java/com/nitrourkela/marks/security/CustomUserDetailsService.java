package com.nitrourkela.marks.security;

import com.nitrourkela.marks.model.entity.Faculty;
import com.nitrourkela.marks.repository.FacultyRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final FacultyRepository facultyRepository;

    public CustomUserDetailsService(FacultyRepository facultyRepository) {
        this.facultyRepository = facultyRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Faculty faculty = facultyRepository.findByEmail(username)
                .or(() -> facultyRepository.findByEmployeeId(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or employee ID: " + username));
        if (!faculty.isActive()) {
            throw new UsernameNotFoundException("User is deactivated");
        }
        return UserPrincipal.create(faculty);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        if (!faculty.isActive()) {
            throw new UsernameNotFoundException("User is deactivated");
        }
        return UserPrincipal.create(faculty);
    }
}
