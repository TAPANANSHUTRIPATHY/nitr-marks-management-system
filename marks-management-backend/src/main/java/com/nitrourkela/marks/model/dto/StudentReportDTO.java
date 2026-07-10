package com.nitrourkela.marks.model.dto;

import java.util.List;
import java.util.UUID;

public record StudentReportDTO(
    UUID studentId,
    String rollNumber,
    String studentName,
    String department,
    int semesterNumber,
    List<SubjectMarkDetail> subjects,
    double sgpa
) {
    public record SubjectMarkDetail(
        String subjectCode,
        String subjectName,
        int credits,
        Double preMidMarks,
        Double postMidMarks,
        Double totalMarks,
        String grade,
        Double gradePoint
    ) {}
}
