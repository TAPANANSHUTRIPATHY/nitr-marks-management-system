package com.nitrourkela.marks.service;

import com.nitrourkela.marks.exception.BadRequestException;
import com.nitrourkela.marks.exception.ResourceNotFoundException;
import com.nitrourkela.marks.model.entity.Faculty;
import com.nitrourkela.marks.model.entity.FacultyAssignment;
import com.nitrourkela.marks.model.entity.SemesterSubject;
import com.nitrourkela.marks.model.enums.AssignmentRole;
import com.nitrourkela.marks.repository.FacultyAssignmentRepository;
import com.nitrourkela.marks.repository.FacultyRepository;
import com.nitrourkela.marks.repository.SemesterSubjectRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final SemesterSubjectRepository semesterSubjectRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyService(FacultyRepository facultyRepository, 
                          FacultyAssignmentRepository facultyAssignmentRepository, 
                          SemesterSubjectRepository semesterSubjectRepository, 
                          PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.facultyAssignmentRepository = facultyAssignmentRepository;
        this.semesterSubjectRepository = semesterSubjectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<Faculty> getAllFaculties() {
        return facultyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Faculty getFacultyById(UUID id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
    }

    @Transactional
    public Faculty createFaculty(Faculty faculty) {
        facultyRepository.findByEmail(faculty.getEmail()).ifPresent(f -> {
            throw new BadRequestException("Faculty with email " + faculty.getEmail() + " already exists");
        });
        facultyRepository.findByEmployeeId(faculty.getEmployeeId()).ifPresent(f -> {
            throw new BadRequestException("Faculty with Employee ID " + faculty.getEmployeeId() + " already exists");
        });

        // Hash password before saving
        faculty.setPasswordHash(passwordEncoder.encode(faculty.getPasswordHash()));
        return facultyRepository.save(faculty);
    }

    @Transactional
    public Faculty updateFaculty(UUID id, Faculty details) {
        Faculty faculty = getFacultyById(id);

        facultyRepository.findByEmail(details.getEmail()).ifPresent(f -> {
            if (!f.getId().equals(id)) {
                throw new BadRequestException("Faculty with email " + details.getEmail() + " already exists");
            }
        });
        facultyRepository.findByEmployeeId(details.getEmployeeId()).ifPresent(f -> {
            if (!f.getId().equals(id)) {
                throw new BadRequestException("Faculty with Employee ID " + details.getEmployeeId() + " already exists");
            }
        });

        faculty.setName(details.getName());
        faculty.setEmail(details.getEmail());
        faculty.setEmployeeId(details.getEmployeeId());
        faculty.setGlobalRole(details.getGlobalRole());
        faculty.setActive(details.isActive());

        if (details.getPasswordHash() != null && !details.getPasswordHash().isEmpty() && !details.getPasswordHash().startsWith("$2a$")) {
            faculty.setPasswordHash(passwordEncoder.encode(details.getPasswordHash()));
        }

        return facultyRepository.save(faculty);
    }

    @Transactional
    public void deleteFaculty(UUID id) {
        Faculty faculty = getFacultyById(id);
        facultyRepository.delete(faculty);
    }

    @Transactional
    public FacultyAssignment assignFacultyToCourse(UUID facultyId, UUID semesterSubjectId, AssignmentRole role, String section) {
        Faculty faculty = getFacultyById(facultyId);
        
        SemesterSubject semesterSubject = semesterSubjectRepository.findById(semesterSubjectId)
                .orElseThrow(() -> new ResourceNotFoundException("SemesterSubject mapping not found with id: " + semesterSubjectId));

        // Enforce: Course Coordinator can only be ONE per semester-subject
        if (role == AssignmentRole.COORDINATOR) {
            List<FacultyAssignment> coordinators = facultyAssignmentRepository
                    .findBySemesterSubjectIdAndAssignmentRole(semesterSubjectId, AssignmentRole.COORDINATOR);
            if (!coordinators.isEmpty()) {
                throw new BadRequestException("A Course Coordinator is already assigned to this subject-semester mapping");
            }
        }

        // Check if assignment already exists
        facultyAssignmentRepository.findBySemesterSubjectIdAndFacultyId(semesterSubjectId, facultyId).ifPresent(a -> {
            throw new BadRequestException("Faculty is already assigned to this course");
        });

        FacultyAssignment assignment = new FacultyAssignment(faculty, semesterSubject, role, section);
        return facultyAssignmentRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public List<FacultyAssignment> getFacultyAssignments(UUID facultyId) {
        return facultyAssignmentRepository.findByFacultyId(facultyId);
    }

    @Transactional(readOnly = true)
    public List<FacultyAssignment> getAssignmentsBySubject(UUID semesterSubjectId) {
        return facultyAssignmentRepository.findBySemesterSubjectId(semesterSubjectId);
    }

    @Transactional
    public void removeAssignment(UUID assignmentId) {
        FacultyAssignment assignment = facultyAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));
        facultyAssignmentRepository.delete(assignment);
    }
}
