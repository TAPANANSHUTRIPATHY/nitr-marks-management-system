package com.nitrourkela.marks.controller;

import com.nitrourkela.marks.model.dto.GradeResult;
import com.nitrourkela.marks.model.entity.GradeBoundary;
import com.nitrourkela.marks.model.entity.GradingScheme;
import com.nitrourkela.marks.service.GradingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/grading")
public class GradingController {

    private final GradingService gradingService;

    public GradingController(GradingService gradingService) {
        this.gradingService = gradingService;
    }

    @GetMapping("/schemes")
    public ResponseEntity<List<GradingScheme>> getAllSchemes() {
        return ResponseEntity.ok(gradingService.getAllSchemes());
    }

    @GetMapping("/schemes/default")
    public ResponseEntity<GradingScheme> getDefaultScheme() {
        return ResponseEntity.ok(gradingService.getDefaultScheme());
    }

    @GetMapping("/schemes/{schemeId}/boundaries")
    public ResponseEntity<List<GradeBoundary>> getBoundaries(@PathVariable UUID schemeId) {
        return ResponseEntity.ok(gradingService.getBoundaries(schemeId));
    }

    @PutMapping("/schemes/{schemeId}/boundaries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GradeBoundary>> updateBoundaries(@PathVariable UUID schemeId, @RequestBody List<GradeBoundary> boundaries) {
        return ResponseEntity.ok(gradingService.updateBoundaries(schemeId, boundaries));
    }

    @GetMapping("/preview")
    public ResponseEntity<GradeResult> previewGrade(@RequestParam double percentage) {
        return ResponseEntity.ok(gradingService.calculateGrade(percentage));
    }
}
