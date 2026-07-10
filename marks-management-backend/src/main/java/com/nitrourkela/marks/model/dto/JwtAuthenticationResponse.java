package com.nitrourkela.marks.model.dto;

import java.util.UUID;

public record JwtAuthenticationResponse(
    String accessToken,
    String tokenType,
    UUID id,
    String name,
    String email,
    String role,
    String employeeId
) {
    public JwtAuthenticationResponse(String accessToken, UUID id, String name, String email, String role, String employeeId) {
        this(accessToken, "Bearer", id, name, email, role, employeeId);
    }
}
