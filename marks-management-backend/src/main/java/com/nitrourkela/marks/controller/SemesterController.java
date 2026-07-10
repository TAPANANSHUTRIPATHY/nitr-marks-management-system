package com.nitrourkela.marks.controller;

import com.nitrourkela.marks.model.entity.Semester;
import com.nitrourkela.marks.service.SemesterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class SemesterController {

    private final SemesterService semesterService;

    public SemesterController(SemesterService semesterService) {
        this.semesterService = semesterService;
    }

    @GetMapping("/semesters")
    public ResponseEntity<List<Semester>> getAllSemesters() {
        return ResponseEntity.ok(semesterService.getAllSemesters());
    }

    @GetMapping("/sessions/{sessionId}/semesters")
    public ResponseEntity<List<Semester>> getSemestersBySession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(semesterService.getSemestersBySession(sessionId));
    }

    @GetMapping("/semesters/{id}")
    public ResponseEntity<Semester> getSemesterById(@PathVariable UUID id) {
        return ResponseEntity.ok(semesterService.getSemesterById(id));
    }

    @PostMapping("/sessions/{sessionId}/semesters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Semester> createSemester(@PathVariable UUID sessionId, @Valid @RequestBody Semester semester) {
        return new ResponseEntity<>(semesterService.createSemester(sessionId, semester), HttpStatus.CREATED);
    }

    @PutMapping("/semesters/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Semester> updateSemester(@PathVariable UUID id, @Valid @RequestBody Semester semesterDetails) {
        return ResponseEntity.ok(semesterService.updateSemester(id, semesterDetails));
    }

    @DeleteMapping("/semesters/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSemester(@PathVariable UUID id) {
        semesterService.deleteSemester(id);
        return ResponseEntity.noContent().build();
    }
}
