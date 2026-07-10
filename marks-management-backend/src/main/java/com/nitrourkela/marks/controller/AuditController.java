package com.nitrourkela.marks.controller;

import com.nitrourkela.marks.model.entity.AuditLog;
import com.nitrourkela.marks.repository.AuditLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogRepository.findAll());
    }

    @GetMapping("/entity/{entityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getLogsByEntity(
            @RequestParam String entity,
            @PathVariable UUID entityId) {
        return ResponseEntity.ok(auditLogRepository.findByEntityAndEntityIdOrderByTimestampDesc(entity, entityId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getLogsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(auditLogRepository.findByUserIdOrderByTimestampDesc(userId));
    }
}
