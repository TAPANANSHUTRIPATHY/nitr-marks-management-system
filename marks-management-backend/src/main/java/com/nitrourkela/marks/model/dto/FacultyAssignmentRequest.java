package com.nitrourkela.marks.model.dto;

import com.nitrourkela.marks.model.enums.AssignmentRole;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record FacultyAssignmentRequest(
    @NotNull(message = "Faculty ID is required")
    UUID facultyId,

    @NotNull(message = "SemesterSubject ID is required")
    UUID semesterSubjectId,

    @NotNull(message = "Assignment role is required")
    AssignmentRole assignmentRole,

    String section // Nullable
) {}
