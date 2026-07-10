package com.nitrourkela.marks.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "semester_subjects", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"semester_id", "subject_id"})
})
public class SemesterSubject {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
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
}
