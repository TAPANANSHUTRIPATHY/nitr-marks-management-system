package com.nitrourkela.marks.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, STATUS_CHANGE

    @Column(nullable = false)
    private String entity; // e.g. "Marks"

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "previous_values", columnDefinition = "TEXT")
    private String previousValues; // JSON string

    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues; // JSON string

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    // Constructors
    public AuditLog() {}

    public AuditLog(UUID userId, String action, String entity, UUID entityId, String previousValues, String newValues) {
        this.userId = userId;
        this.action = action;
        this.entity = entity;
        this.entityId = entityId;
        this.previousValues = previousValues;
        this.newValues = newValues;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntity() { return entity; }
    public void setEntity(String entity) { this.entity = entity; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public String getPreviousValues() { return previousValues; }
    public void setPreviousValues(String previousValues) { this.previousValues = previousValues; }

    public String getNewValues() { return newValues; }
    public void setNewValues(String newValues) { this.newValues = newValues; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
