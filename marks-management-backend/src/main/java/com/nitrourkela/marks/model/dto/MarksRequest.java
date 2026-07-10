package com.nitrourkela.marks.model.dto;

import java.util.UUID;

public record MarksRequest(
    UUID studentId,
    Double preMidMarks, // Nullable
    Double postMidMarks // Nullable
) {}
