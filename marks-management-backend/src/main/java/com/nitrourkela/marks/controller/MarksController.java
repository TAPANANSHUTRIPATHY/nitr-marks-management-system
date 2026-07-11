package com.nitrourkela.marks.controller;

import com.nitrourkela.marks.model.dto.MarksRequest;
import com.nitrourkela.marks.model.dto.StudentMarksDTO;
import com.nitrourkela.marks.model.entity.Marks;
import com.nitrourkela.marks.service.MarksService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/marks")
public class MarksController {

    private final MarksService marksService;

    public MarksController(MarksService marksService) {
        this.marksService = marksService;
    }

    @GetMapping("/{semesterSubjectId}")
    @PreAuthorize("@rbacService.hasAccessToSubject(#a0)")
    public ResponseEntity<List<StudentMarksDTO>> getMarksForSubject(@PathVariable UUID semesterSubjectId) {
        return ResponseEntity.ok(marksService.getMarksForSubject(semesterSubjectId));
    }

    @PutMapping("/{semesterSubjectId}/batch")
    @PreAuthorize("@rbacService.hasAccessToSubject(#a0)")
    public ResponseEntity<List<Marks>> saveBatchMarks(
            @PathVariable UUID semesterSubjectId,
            @RequestBody List<MarksRequest> requests) {
        return ResponseEntity.ok(marksService.saveBatchMarks(semesterSubjectId, requests));
    }

    @PostMapping("/{semesterSubjectId}/submit")
    @PreAuthorize("@rbacService.isCoordinator(#a0)")
    public ResponseEntity<Map<String, String>> submitMarks(@PathVariable UUID semesterSubjectId) {
        marksService.submitMarks(semesterSubjectId);
        return ResponseEntity.ok(Map.of("message", "Marks submitted successfully"));
    }

    @PostMapping("/{semesterSubjectId}/lock")
    @PreAuthorize("@rbacService.isCoordinator(#a0)")
    public ResponseEntity<Map<String, String>> lockMarks(@PathVariable UUID semesterSubjectId) {
        marksService.lockMarks(semesterSubjectId);
        return ResponseEntity.ok(Map.of("message", "Marks locked successfully"));
    }

    @GetMapping("/sgpa")
    public ResponseEntity<Map<String, Object>> getSGPA(
            @RequestParam UUID studentId,
            @RequestParam UUID semesterId) {
        double sgpa = marksService.computeSGPA(studentId, semesterId);
        return ResponseEntity.ok(Map.of("studentId", studentId, "semesterId", semesterId, "sgpa", sgpa));
    }
}
