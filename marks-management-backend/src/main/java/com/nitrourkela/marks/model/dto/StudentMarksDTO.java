package com.nitrourkela.marks.model.dto;

import com.nitrourkela.marks.model.enums.MarksStatus;
import java.util.UUID;

public record StudentMarksDTO(
    UUID studentId,
    String rollNumber,
    String studentName,
    String department,
    Double preMidMarks,
    Double postMidMarks,
    Double totalMarks,
    Double percentage,
    String autoGrade,
    Double gradePoint,
    MarksStatus status,
    boolean isEditable
) {}
