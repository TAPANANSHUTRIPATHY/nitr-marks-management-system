package com.nitrourkela.marks.service;

import com.nitrourkela.marks.model.dto.GradeResult;
import com.nitrourkela.marks.repository.GradeBoundaryRepository;
import com.nitrourkela.marks.repository.GradingSchemeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

public class GradingServiceTest {

    private GradingSchemeRepository gradingSchemeRepository;
    private GradeBoundaryRepository gradeBoundaryRepository;
    private GradingService gradingService;

    @BeforeEach
    public void setUp() {
        gradingSchemeRepository = Mockito.mock(GradingSchemeRepository.class);
        gradeBoundaryRepository = Mockito.mock(GradeBoundaryRepository.class);
        gradingService = new GradingService(gradingSchemeRepository, gradeBoundaryRepository);
    }

    @Test
    public void testCalculateGradeFallback() {
        // When database schemes are empty, it should use the fallback logic
        when(gradingSchemeRepository.findByIsDefaultTrue()).thenReturn(Optional.empty());

        // Test boundary values
        assertEquals(new GradeResult("O", 10.0), gradingService.calculateGrade(95.0));
        assertEquals(new GradeResult("O", 10.0), gradingService.calculateGrade(90.0));
        assertEquals(new GradeResult("E", 9.0), gradingService.calculateGrade(89.0));
        assertEquals(new GradeResult("E", 9.0), gradingService.calculateGrade(80.0));
        assertEquals(new GradeResult("A", 8.0), gradingService.calculateGrade(75.0));
        assertEquals(new GradeResult("B", 7.0), gradingService.calculateGrade(65.0));
        assertEquals(new GradeResult("C", 6.0), gradingService.calculateGrade(55.0));
        assertEquals(new GradeResult("D", 5.0), gradingService.calculateGrade(45.0));
        assertEquals(new GradeResult("F", 0.0), gradingService.calculateGrade(35.0));
    }

    @Test
    public void testCalculateGradeRounding() {
        when(gradingSchemeRepository.findByIsDefaultTrue()).thenReturn(Optional.empty());

        // Test rounding boundary values (.5 rounds up, <.5 rounds down)
        assertEquals(new GradeResult("O", 10.0), gradingService.calculateGrade(89.5)); // rounds to 90
        assertEquals(new GradeResult("E", 9.0), gradingService.calculateGrade(89.4));  // rounds to 89
        assertEquals(new GradeResult("D", 5.0), gradingService.calculateGrade(39.5));  // rounds to 40
        assertEquals(new GradeResult("F", 0.0), gradingService.calculateGrade(39.4));  // rounds to 39
    }
}
