package com.nitrourkela.marks.model.entity;

import com.nitrourkela.marks.model.enums.AssignmentRole;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "faculty_assignments")
public class FacultyAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semester_subject_id", nullable = false)
    private SemesterSubject semesterSubject;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_role", nullable = false)
    private AssignmentRole assignmentRole;

    @Column
    private String section; // Nullable, e.g., "A", "B". Primarily for Sub-Coordinators

    // Constructors
    public FacultyAssignment() {}

    public FacultyAssignment(Faculty faculty, SemesterSubject semesterSubject, AssignmentRole assignmentRole, String section) {
        this.faculty = faculty;
        this.semesterSubject = semesterSubject;
        this.assignmentRole = assignmentRole;
        this.section = section;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }

    public SemesterSubject getSemesterSubject() { return semesterSubject; }
    public void setSemesterSubject(SemesterSubject semesterSubject) { this.semesterSubject = semesterSubject; }

    public AssignmentRole getAssignmentRole() { return assignmentRole; }
    public void setAssignmentRole(AssignmentRole assignmentRole) { this.assignmentRole = assignmentRole; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
}
