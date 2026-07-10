package com.nitrourkela.marks.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "grading_schemes")
public class GradingScheme {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;

    // Constructors
    public GradingScheme() {}

    public GradingScheme(String name, boolean isDefault) {
        this.name = name;
        this.isDefault = isDefault;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean default1) { isDefault = default1; }
}
