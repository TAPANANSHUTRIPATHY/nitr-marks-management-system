package com.nitrourkela.marks.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int credits;

    @Column(name = "max_marks_pre_mid", nullable = false)
    private int maxMarksPreMid;

    @Column(name = "max_marks_post_mid", nullable = false)
    private int maxMarksPostMid;

    @Column(name = "total_max_marks", nullable = false)
    private int totalMaxMarks;

    @PrePersist
    @PreUpdate
    protected void calculateTotalMaxMarks() {
        this.totalMaxMarks = this.maxMarksPreMid + this.maxMarksPostMid;
    }

    // Constructors
    public Subject() {}

    public Subject(String code, String name, int credits, int maxMarksPreMid, int maxMarksPostMid) {
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.maxMarksPreMid = maxMarksPreMid;
        this.maxMarksPostMid = maxMarksPostMid;
        this.totalMaxMarks = maxMarksPreMid + maxMarksPostMid;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public int getMaxMarksPreMid() { return maxMarksPreMid; }
    public void setMaxMarksPreMid(int maxMarksPreMid) { this.maxMarksPreMid = maxMarksPreMid; }

    public int getMaxMarksPostMid() { return maxMarksPostMid; }
    public void setMaxMarksPostMid(int maxMarksPostMid) { this.maxMarksPostMid = maxMarksPostMid; }

    public int getTotalMaxMarks() { return totalMaxMarks; }
    public void setTotalMaxMarks(int totalMaxMarks) { this.totalMaxMarks = totalMaxMarks; }
}
