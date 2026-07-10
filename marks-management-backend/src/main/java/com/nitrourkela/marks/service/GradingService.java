package com.nitrourkela.marks.service;

import com.nitrourkela.marks.exception.ResourceNotFoundException;
import com.nitrourkela.marks.model.dto.GradeResult;
import com.nitrourkela.marks.model.entity.GradeBoundary;
import com.nitrourkela.marks.model.entity.GradingScheme;
import com.nitrourkela.marks.repository.GradeBoundaryRepository;
import com.nitrourkela.marks.repository.GradingSchemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class GradingService {

    private final GradingSchemeRepository gradingSchemeRepository;
    private final GradeBoundaryRepository gradeBoundaryRepository;

    public GradingService(GradingSchemeRepository gradingSchemeRepository, GradeBoundaryRepository gradeBoundaryRepository) {
        this.gradingSchemeRepository = gradingSchemeRepository;
        this.gradeBoundaryRepository = gradeBoundaryRepository;
    }

    @Transactional(readOnly = true)
    public List<GradingScheme> getAllSchemes() {
        return gradingSchemeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public GradingScheme getDefaultScheme() {
        return gradingSchemeRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new ResourceNotFoundException("Default Grading Scheme not found"));
    }

    @Transactional(readOnly = true)
    public List<GradeBoundary> getBoundaries(UUID schemeId) {
        return gradeBoundaryRepository.findBySchemeId(schemeId);
    }

    @Transactional
    public List<GradeBoundary> updateBoundaries(UUID schemeId, List<GradeBoundary> newBoundaries) {
        GradingScheme scheme = gradingSchemeRepository.findById(schemeId)
                .orElseThrow(() -> new ResourceNotFoundException("Grading Scheme not found with id: " + schemeId));

        // Delete existing boundaries for this scheme
        List<GradeBoundary> existing = gradeBoundaryRepository.findBySchemeId(schemeId);
        gradeBoundaryRepository.deleteAll(existing);

        // Save new boundaries
        for (GradeBoundary boundary : newBoundaries) {
            boundary.setScheme(scheme);
        }
        return gradeBoundaryRepository.saveAll(newBoundaries);
    }

    @Transactional(readOnly = true)
    public GradeResult calculateGrade(double percentage) {
        Optional<GradingScheme> defaultSchemeOpt = gradingSchemeRepository.findByIsDefaultTrue();
        
        if (defaultSchemeOpt.isPresent()) {
            List<GradeBoundary> boundaries = gradeBoundaryRepository.findBySchemeId(defaultSchemeOpt.get().getId());
            // Round percentage to nearest integer for standard range lookup (or match floating range)
            long rounded = Math.round(percentage);
            for (GradeBoundary boundary : boundaries) {
                if (rounded >= boundary.getMinPercentage() && rounded <= boundary.getMaxPercentage()) {
                    return new GradeResult(boundary.getGrade(), boundary.getGradePoint());
                }
            }
        }

        // Fallback standard NIT Rourkela grading
        long rounded = Math.round(percentage);
        if (rounded >= 90) return new GradeResult("O", 10.0);
        if (rounded >= 80) return new GradeResult("E", 9.0);
        if (rounded >= 70) return new GradeResult("A", 8.0);
        if (rounded >= 60) return new GradeResult("B", 7.0);
        if (rounded >= 50) return new GradeResult("C", 6.0);
        if (rounded >= 40) return new GradeResult("D", 5.0);
        return new GradeResult("F", 0.0);
    }
}
