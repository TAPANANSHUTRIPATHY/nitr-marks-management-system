package com.nitrourkela.marks.controller;

import com.nitrourkela.marks.model.entity.SemesterSubject;
import com.nitrourkela.marks.model.entity.Subject;
import com.nitrourkela.marks.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/subjects/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable UUID id) {
        return ResponseEntity.ok(subjectService.getSubjectById(id));
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subject> createSubject(@Valid @RequestBody Subject subject) {
        return new ResponseEntity<>(subjectService.createSubject(subject), HttpStatus.CREATED);
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subject> updateSubject(@PathVariable UUID id, @Valid @RequestBody Subject subjectDetails) {
        return ResponseEntity.ok(subjectService.updateSubject(id, subjectDetails));
    }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubject(@PathVariable UUID id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }

    // Mapping Semester-Subject mappings
    @GetMapping("/semesters/{semesterId}/subjects")
    public ResponseEntity<List<SemesterSubject>> getSemesterSubjects(@PathVariable UUID semesterId) {
        return ResponseEntity.ok(subjectService.getSemesterSubjects(semesterId));
    }

    @PostMapping("/semesters/{semesterId}/subjects/{subjectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SemesterSubject> mapSubjectToSemester(@PathVariable UUID semesterId, @PathVariable UUID subjectId) {
        return new ResponseEntity<>(subjectService.mapSubjectToSemester(semesterId, subjectId), HttpStatus.CREATED);
    }

    @DeleteMapping("/semesters/{semesterId}/subjects/{subjectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unmapSubjectFromSemester(@PathVariable UUID semesterId, @PathVariable UUID subjectId) {
        subjectService.unmapSubjectFromSemester(semesterId, subjectId);
        return ResponseEntity.noContent().build();
    }
}
