import { describe, it, expect } from 'vitest';
import { calculateGrade, getGradeColor } from './grading';

describe('calculateGrade', () => {
  const maxPreMid = 40;
  const maxPostMid = 60;

  it('returns dashes when both marks are null/undefined', () => {
    const result = calculateGrade(null, null, maxPreMid, maxPostMid);
    expect(result.total).toBe('-');
    expect(result.percentage).toBe('-');
    expect(result.grade).toBe('-');
    expect(result.gradePoint).toBe('-');
  });

  it('returns dashes when both marks are empty strings', () => {
    const result = calculateGrade('', '', maxPreMid, maxPostMid);
    expect(result.grade).toBe('-');
  });

  it('calculates Outstanding grade (O) for >= 90%', () => {
    // 36/40 + 55/60 = 91/100 = 91%
    const result = calculateGrade(36, 55, maxPreMid, maxPostMid);
    expect(result.total).toBe(91);
    expect(result.percentage).toBe(91);
    expect(result.grade).toBe('O');
    expect(result.gradePoint).toBe(10);
  });

  it('calculates Excellent grade (E) for 80-89%', () => {
    // 32/40 + 53/60 = 85/100 = 85%
    const result = calculateGrade(32, 53, maxPreMid, maxPostMid);
    expect(result.total).toBe(85);
    expect(result.grade).toBe('E');
    expect(result.gradePoint).toBe(9);
  });

  it('calculates A grade for 70-79%', () => {
    const result = calculateGrade(28, 47, maxPreMid, maxPostMid);
    expect(result.total).toBe(75);
    expect(result.grade).toBe('A');
    expect(result.gradePoint).toBe(8);
  });

  it('calculates B grade for 60-69%', () => {
    const result = calculateGrade(25, 40, maxPreMid, maxPostMid);
    expect(result.total).toBe(65);
    expect(result.grade).toBe('B');
    expect(result.gradePoint).toBe(7);
  });

  it('calculates C grade for 50-59%', () => {
    const result = calculateGrade(20, 35, maxPreMid, maxPostMid);
    expect(result.total).toBe(55);
    expect(result.grade).toBe('C');
    expect(result.gradePoint).toBe(6);
  });

  it('calculates D grade for 40-49%', () => {
    const result = calculateGrade(18, 27, maxPreMid, maxPostMid);
    expect(result.total).toBe(45);
    expect(result.grade).toBe('D');
    expect(result.gradePoint).toBe(5);
  });

  it('calculates F grade for < 40%', () => {
    const result = calculateGrade(10, 20, maxPreMid, maxPostMid);
    expect(result.total).toBe(30);
    expect(result.grade).toBe('F');
    expect(result.gradePoint).toBe(0);
  });

  it('handles only pre-mid marks (post is null)', () => {
    const result = calculateGrade(36, null, maxPreMid, maxPostMid);
    // 36 + 0 = 36 out of 100 = 36%
    expect(result.total).toBe(36);
    expect(result.grade).toBe('F');
  });

  it('handles only post-mid marks (pre is null)', () => {
    const result = calculateGrade(null, 55, maxPreMid, maxPostMid);
    // 0 + 55 = 55 out of 100 = 55%
    expect(result.total).toBe(55);
    expect(result.grade).toBe('C');
  });

  it('handles rounding boundary (89.5% rounds to 90 → O)', () => {
    // 89.5 out of 100
    const result = calculateGrade(35.8, 53.7, maxPreMid, maxPostMid);
    // 35.8 + 53.7 = 89.5, percentage = 89.5, rounds to 90
    expect(result.grade).toBe('O');
    expect(result.gradePoint).toBe(10);
  });

  it('handles zero max marks gracefully', () => {
    const result = calculateGrade(10, 20, 0, 0);
    expect(result.grade).toBe('F');
    expect(result.gradePoint).toBe(0);
  });

  it('handles string numeric values', () => {
    const result = calculateGrade('36', '55', maxPreMid, maxPostMid);
    expect(result.total).toBe(91);
    expect(result.grade).toBe('O');
  });
});

describe('getGradeColor', () => {
  it('returns correct CSS variable for each grade', () => {
    expect(getGradeColor('O')).toBe('var(--grade-o)');
    expect(getGradeColor('E')).toBe('var(--grade-e)');
    expect(getGradeColor('A')).toBe('var(--grade-a)');
    expect(getGradeColor('B')).toBe('var(--grade-b)');
    expect(getGradeColor('C')).toBe('var(--grade-c)');
    expect(getGradeColor('D')).toBe('var(--grade-d)');
    expect(getGradeColor('F')).toBe('var(--grade-f)');
  });

  it('returns secondary text color for unknown grades', () => {
    expect(getGradeColor('X')).toBe('var(--text-secondary)');
    expect(getGradeColor('')).toBe('var(--text-secondary)');
    expect(getGradeColor(null)).toBe('var(--text-secondary)');
  });
});
