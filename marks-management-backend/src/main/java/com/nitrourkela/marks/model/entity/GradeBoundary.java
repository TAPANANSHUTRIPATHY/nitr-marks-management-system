package com.nitrourkela.marks.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "grade_boundaries")
public class GradeBoundary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "scheme_id", nullable = false)
    private GradingScheme scheme;

    @Column(nullable = false)
    private String grade; // O, E, A, B, C, D, F

    @Column(name = "min_percentage", nullable = false)
    private int minPercentage;

    @Column(name = "max_percentage", nullable = false)
    private int maxPercentage;

    @Column(name = "grade_point", nullable = false)
    private float gradePoint; // 10.0, 9.0... 0.0

    // Constructors
    public GradeBoundary() {}

    public GradeBoundary(GradingScheme scheme, String grade, int minPercentage, int maxPercentage, float gradePoint) {
        this.scheme = scheme;
        this.grade = grade;
        this.minPercentage = minPercentage;
        this.maxPercentage = maxPercentage;
        this.gradePoint = gradePoint;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public GradingScheme getScheme() { return scheme; }
    public void setScheme(GradingScheme scheme) { this.scheme = scheme; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public int getMinPercentage() { return minPercentage; }
    public void setMinPercentage(int minPercentage) { this.minPercentage = minPercentage; }

    public int getMaxPercentage() { return maxPercentage; }
    public void setMaxPercentage(int maxPercentage) { this.maxPercentage = maxPercentage; }

    public float getGradePoint() { return gradePoint; }
    public void setGradePoint(float gradePoint) { this.gradePoint = gradePoint; }
}
