package com.nitrourkela.marks.model.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Username/Email cannot be blank")
    String username, // Can be email or employeeId

    @NotBlank(message = "Password cannot be blank")
    String password
) {}
