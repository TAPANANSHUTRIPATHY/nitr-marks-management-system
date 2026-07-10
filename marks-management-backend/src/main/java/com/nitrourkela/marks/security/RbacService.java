package com.nitrourkela.marks.security;

import com.nitrourkela.marks.model.entity.FacultyAssignment;
import com.nitrourkela.marks.model.enums.AssignmentRole;
import com.nitrourkela.marks.model.enums.GlobalRole;
import com.nitrourkela.marks.repository.FacultyAssignmentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service("rbacService")
public class RbacService {

    private final FacultyAssignmentRepository facultyAssignmentRepository;

    public RbacService(FacultyAssignmentRepository facultyAssignmentRepository) {
        this.facultyAssignmentRepository = facultyAssignmentRepository;
    }

    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }
        return principal.getGlobalRole() == GlobalRole.ADMIN;
    }

    public boolean isCoordinator(UUID semesterSubjectId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }
        
        if (principal.getGlobalRole() == GlobalRole.ADMIN) {
            return true;
        }

        Optional<FacultyAssignment> assignment = facultyAssignmentRepository
                .findBySemesterSubjectIdAndFacultyId(semesterSubjectId, principal.getId());

        return assignment.map(value -> value.getAssignmentRole() == AssignmentRole.COORDINATOR).orElse(false);
    }

    public boolean isSubCoordinator(UUID semesterSubjectId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }

        if (principal.getGlobalRole() == GlobalRole.ADMIN) {
            return true;
        }

        Optional<FacultyAssignment> assignment = facultyAssignmentRepository
                .findBySemesterSubjectIdAndFacultyId(semesterSubjectId, principal.getId());

        return assignment.map(value -> value.getAssignmentRole() == AssignmentRole.SUB_COORDINATOR).orElse(false);
    }

    public boolean hasAccessToSubject(UUID semesterSubjectId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }

        if (principal.getGlobalRole() == GlobalRole.ADMIN) {
            return true;
        }

        Optional<FacultyAssignment> assignment = facultyAssignmentRepository
                .findBySemesterSubjectIdAndFacultyId(semesterSubjectId, principal.getId());

        return assignment.isPresent();
    }

    public boolean hasAccessToSection(UUID semesterSubjectId, String section) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }

        if (principal.getGlobalRole() == GlobalRole.ADMIN) {
            return true;
        }

        Optional<FacultyAssignment> assignment = facultyAssignmentRepository
                .findBySemesterSubjectIdAndFacultyId(semesterSubjectId, principal.getId());

        if (assignment.isEmpty()) {
            return false;
        }

        FacultyAssignment fa = assignment.get();
        if (fa.getAssignmentRole() == AssignmentRole.COORDINATOR) {
            return true; // Coordinator has access to all sections
        }

        // Sub-coordinator is limited to their specific section
        return fa.getSection() != null && fa.getSection().equalsIgnoreCase(section);
    }
}
