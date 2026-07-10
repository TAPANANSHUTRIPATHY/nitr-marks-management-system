package com.nitrourkela.marks.controller;

import com.nitrourkela.marks.model.dto.StudentReportDTO;
import com.nitrourkela.marks.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/student/{studentId}/semester/{semesterId}")
    public ResponseEntity<StudentReportDTO> getStudentReport(
            @PathVariable UUID studentId,
            @PathVariable UUID semesterId) {
        return ResponseEntity.ok(reportService.getStudentReport(studentId, semesterId));
    }

    @GetMapping("/distribution/{semesterSubjectId}")
    public ResponseEntity<Map<String, Long>> getGradeDistribution(@PathVariable UUID semesterSubjectId) {
        return ResponseEntity.ok(reportService.getGradeDistribution(semesterSubjectId));
    }
}
