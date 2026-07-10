package com.nitrourkela.marks.config;

import com.nitrourkela.marks.model.entity.Faculty;
import com.nitrourkela.marks.model.entity.GradeBoundary;
import com.nitrourkela.marks.model.entity.GradingScheme;
import com.nitrourkela.marks.model.enums.GlobalRole;
import com.nitrourkela.marks.repository.FacultyRepository;
import com.nitrourkela.marks.repository.GradeBoundaryRepository;
import com.nitrourkela.marks.repository.GradingSchemeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final FacultyRepository facultyRepository;
    private final GradingSchemeRepository gradingSchemeRepository;
    private final GradeBoundaryRepository gradeBoundaryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(FacultyRepository facultyRepository, 
                      GradingSchemeRepository gradingSchemeRepository,
                      GradeBoundaryRepository gradeBoundaryRepository, 
                      PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.gradingSchemeRepository = gradingSchemeRepository;
        this.gradeBoundaryRepository = gradeBoundaryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedGradingScheme();
    }

    private void seedAdminUser() {
        if (facultyRepository.count() == 0) {
            Faculty admin = new Faculty(
                    "ADMIN001",
                    "System Administrator",
                    "admin@nitrourkela.ac.in",
                    passwordEncoder.encode("admin123"), // Default credentials
                    GlobalRole.ADMIN,
                    true
            );
            facultyRepository.save(admin);
            System.out.println("Default Admin user seeded: admin@nitrourkela.ac.in / admin123");
        }
    }

    private void seedGradingScheme() {
        if (gradingSchemeRepository.count() == 0) {
            GradingScheme scheme = new GradingScheme("NIT Rourkela 10-Point Scale", true);
            GradingScheme savedScheme = gradingSchemeRepository.save(scheme);

            List<GradeBoundary> boundaries = Arrays.asList(
                    new GradeBoundary(savedScheme, "O", 90, 100, 10.0f),
                    new GradeBoundary(savedScheme, "E", 80, 89, 9.0f),
                    new GradeBoundary(savedScheme, "A", 70, 79, 8.0f),
                    new GradeBoundary(savedScheme, "B", 60, 69, 7.0f),
                    new GradeBoundary(savedScheme, "C", 50, 59, 6.0f),
                    new GradeBoundary(savedScheme, "D", 40, 49, 5.0f),
                    new GradeBoundary(savedScheme, "F", 0, 39, 0.0f)
            );
            gradeBoundaryRepository.saveAll(boundaries);
            System.out.println("Default NIT Rourkela 10-Point Grading Scheme seeded.");
        }
    }
}
