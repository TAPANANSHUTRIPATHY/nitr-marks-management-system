package com.nitrourkela.marks.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "semester_subjects", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"semester_id", "subject_id"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SemesterSubject {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semester_id", nullable = false)
    @JsonIgnore
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Subject subject;

    // Constructors
    public SemesterSubject() {}

    public SemesterSubject(Semester semester, Subject subject) {
        this.semester = semester;
        this.subject = subject;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Semester getSemester() { return semester; }
    public void setSemester(Semester semester) { this.semester = semester; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    @JsonProperty("semesterId")
    public UUID getSemesterId() {
        return semester != null ? semester.getId() : null;
    }

    @JsonProperty("semesterNumber")
    public Integer getSemesterNumber() {
        return semester != null ? semester.getNumber() : null;
    }

    @JsonProperty("semesterType")
    public String getSemesterType() {
        return semester != null && semester.getType() != null ? semester.getType().name() : null;
    }
}
