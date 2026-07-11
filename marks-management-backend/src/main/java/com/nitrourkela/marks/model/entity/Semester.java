package com.nitrourkela.marks.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nitrourkela.marks.model.enums.SemesterType;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "semesters", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "number"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Semester {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private int number;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AcademicSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SemesterType type;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = false;

    // Constructors
    public Semester() {}

    public Semester(int number, AcademicSession session, SemesterType type, boolean isActive) {
        this.number = number;
        this.session = session;
        this.type = type;
        this.isActive = isActive;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public AcademicSession getSession() { return session; }
    public void setSession(AcademicSession session) { this.session = session; }

    public SemesterType getType() { return type; }
    public void setType(SemesterType type) { this.type = type; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    @JsonProperty("sessionId")
    public UUID getSessionId() {
        return session != null ? session.getId() : null;
    }
}
