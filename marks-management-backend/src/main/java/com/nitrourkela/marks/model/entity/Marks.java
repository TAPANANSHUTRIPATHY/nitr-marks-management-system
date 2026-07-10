package com.nitrourkela.marks.model.entity;

import com.nitrourkela.marks.model.enums.MarksStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "marks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "semester_subject_id"})
})
public class Marks {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semester_subject_id", nullable = false)
    private SemesterSubject semesterSubject;

    @Column(name = "pre_mid_marks")
    private Double preMidMarks; // Nullable (if not entered yet)

    @Column(name = "post_mid_marks")
    private Double postMidMarks; // Nullable

    @Column(name = "total_marks")
    private Double totalMarks; // Computed: preMid + postMid

    @Column(name = "percentage")
    private Double percentage; // Computed: total / max * 100

    @Column(name = "auto_grade")
    private String autoGrade; // O, E, A, B, C, D, F

    @Column(name = "grade_point")
    private Double gradePoint; // 10.0, 9.0... 0.0

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarksStatus status = MarksStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entered_by_faculty_id")
    private Faculty enteredBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    protected void onSaveOrUpdate() {
        updatedAt = LocalDateTime.now();
        calculateTotals();
    }

    public void calculateTotals() {
        if (preMidMarks != null || postMidMarks != null) {
            double pre = preMidMarks != null ? preMidMarks : 0.0;
            double post = postMidMarks != null ? postMidMarks : 0.0;
            this.totalMarks = pre + post;
            
            if (semesterSubject != null && semesterSubject.getSubject() != null) {
                double max = semesterSubject.getSubject().getTotalMaxMarks();
                if (max > 0) {
                    this.percentage = (this.totalMarks / max) * 100.0;
                } else {
                    this.percentage = 0.0;
                }
            }
        } else {
            this.totalMarks = null;
            this.percentage = null;
        }
    }

    // Constructors
    public Marks() {}

    public Marks(Student student, SemesterSubject semesterSubject, Double preMidMarks, Double postMidMarks, Faculty enteredBy) {
        this.student = student;
        this.semesterSubject = semesterSubject;
        this.preMidMarks = preMidMarks;
        this.postMidMarks = postMidMarks;
        this.enteredBy = enteredBy;
        calculateTotals();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public SemesterSubject getSemesterSubject() { return semesterSubject; }
    public void setSemesterSubject(SemesterSubject semesterSubject) { this.semesterSubject = semesterSubject; }

    public Double getPreMidMarks() { return preMidMarks; }
    public void setPreMidMarks(Double preMidMarks) { 
        this.preMidMarks = preMidMarks; 
        calculateTotals();
    }

    public Double getPostMidMarks() { return postMidMarks; }
    public void setPostMidMarks(Double postMidMarks) { 
        this.postMidMarks = postMidMarks; 
        calculateTotals();
    }

    public Double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Double totalMarks) { this.totalMarks = totalMarks; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getAutoGrade() { return autoGrade; }
    public void setAutoGrade(String autoGrade) { this.autoGrade = autoGrade; }

    public Double getGradePoint() { return gradePoint; }
    public void setGradePoint(Double gradePoint) { this.gradePoint = gradePoint; }

    public MarksStatus getStatus() { return status; }
    public void setStatus(MarksStatus status) { this.status = status; }

    public Faculty getEnteredBy() { return enteredBy; }
    public void setEnteredBy(Faculty enteredBy) { this.enteredBy = enteredBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
