package com.nitrourkela.marks.service;

import com.nitrourkela.marks.model.entity.*;
import com.nitrourkela.marks.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

public class MarksServiceTest {

    private MarksRepository marksRepository;
    private StudentRepository studentRepository;
    private SemesterSubjectRepository semesterSubjectRepository;
    private FacultyRepository facultyRepository;
    private FacultyAssignmentRepository facultyAssignmentRepository;
    private AuditLogRepository auditLogRepository;
    private GradingService gradingService;
    private MarksService marksService;

    @BeforeEach
    public void setUp() {
        marksRepository = Mockito.mock(MarksRepository.class);
        studentRepository = Mockito.mock(StudentRepository.class);
        semesterSubjectRepository = Mockito.mock(SemesterSubjectRepository.class);
        facultyRepository = Mockito.mock(FacultyRepository.class);
        facultyAssignmentRepository = Mockito.mock(FacultyAssignmentRepository.class);
        auditLogRepository = Mockito.mock(AuditLogRepository.class);
        gradingService = Mockito.mock(GradingService.class);

        marksService = new MarksService(
                marksRepository,
                studentRepository,
                semesterSubjectRepository,
                facultyRepository,
                facultyAssignmentRepository,
                auditLogRepository,
                gradingService
        );
    }

    @Test
    public void testComputeSGPA() {
        UUID studentId = UUID.randomUUID();
        UUID semesterId = UUID.randomUUID();
        UUID otherSemesterId = UUID.randomUUID();

        Student student = new Student();
        student.setId(studentId);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        // Create Semesters
        Semester sem = new Semester();
        sem.setId(semesterId);

        Semester otherSem = new Semester();
        otherSem.setId(otherSemesterId);

        // Subject 1: 4 credits, Grade O -> GP 10
        Subject sub1 = new Subject();
        sub1.setCredits(4);
        SemesterSubject ss1 = new SemesterSubject();
        ss1.setId(UUID.randomUUID());
        ss1.setSemester(sem);
        ss1.setSubject(sub1);

        Marks m1 = new Marks();
        m1.setSemesterSubject(ss1);
        m1.setGradePoint(10.0);

        // Subject 2: 3 credits, Grade A -> GP 8
        Subject sub2 = new Subject();
        sub2.setCredits(3);
        SemesterSubject ss2 = new SemesterSubject();
        ss2.setId(UUID.randomUUID());
        ss2.setSemester(sem);
        ss2.setSubject(sub2);

        Marks m2 = new Marks();
        m2.setSemesterSubject(ss2);
        m2.setGradePoint(8.0);

        // Subject 3: 3 credits, Grade E -> GP 9
        Subject sub3 = new Subject();
        sub3.setCredits(3);
        SemesterSubject ss3 = new SemesterSubject();
        ss3.setId(UUID.randomUUID());
        ss3.setSemester(sem);
        ss3.setSubject(sub3);

        Marks m3 = new Marks();
        m3.setSemesterSubject(ss3);
        m3.setGradePoint(9.0);

        // Subject 4 in another semester (should be ignored)
        Subject sub4 = new Subject();
        sub4.setCredits(4);
        SemesterSubject ss4 = new SemesterSubject();
        ss4.setId(UUID.randomUUID());
        ss4.setSemester(otherSem);
        ss4.setSubject(sub4);

        Marks m4 = new Marks();
        m4.setSemesterSubject(ss4);
        m4.setGradePoint(10.0);

        List<Marks> studentMarks = Arrays.asList(m1, m2, m3, m4);
        when(marksRepository.findByStudentId(studentId)).thenReturn(studentMarks);

        // Calculate expected SGPA: (4 * 10 + 3 * 8 + 3 * 9) / 10 = 91 / 10 = 9.10
        double calculatedSgpa = marksService.computeSGPA(studentId, semesterId);
        assertEquals(9.10, calculatedSgpa, 0.001);
    }
}
