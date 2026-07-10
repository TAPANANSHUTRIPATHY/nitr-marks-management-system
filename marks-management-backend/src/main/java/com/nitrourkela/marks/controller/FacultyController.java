package com.nitrourkela.marks.controller;

import com.nitrourkela.marks.model.dto.FacultyAssignmentRequest;
import com.nitrourkela.marks.model.entity.Faculty;
import com.nitrourkela.marks.model.entity.FacultyAssignment;
import com.nitrourkela.marks.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping
    public ResponseEntity<List<Faculty>> getAllFaculties() {
        return ResponseEntity.ok(facultyService.getAllFaculties());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Faculty> getFacultyById(@PathVariable UUID id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Faculty> createFaculty(@Valid @RequestBody Faculty faculty) {
        return new ResponseEntity<>(facultyService.createFaculty(faculty), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Faculty> updateFaculty(@PathVariable UUID id, @Valid @RequestBody Faculty details) {
        return ResponseEntity.ok(facultyService.updateFaculty(id, details));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFaculty(@PathVariable UUID id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.noContent().build();
    }

    // Faculty Assignments
    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacultyAssignment> assignFacultyToCourse(@Valid @RequestBody FacultyAssignmentRequest request) {
        return new ResponseEntity<>(facultyService.assignFacultyToCourse(
                request.facultyId(),
                request.semesterSubjectId(),
                request.assignmentRole(),
                request.section()
        ), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<FacultyAssignment>> getFacultyAssignments(@PathVariable UUID id) {
        return ResponseEntity.ok(facultyService.getFacultyAssignments(id));
    }

    @GetMapping("/assignments/subject/{semesterSubjectId}")
    public ResponseEntity<List<FacultyAssignment>> getAssignmentsBySubject(@PathVariable UUID semesterSubjectId) {
        return ResponseEntity.ok(facultyService.getAssignmentsBySubject(semesterSubjectId));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeAssignment(@PathVariable UUID assignmentId) {
        facultyService.removeAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }
}
