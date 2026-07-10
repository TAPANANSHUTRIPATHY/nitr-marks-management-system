package com.nitrourkela.marks.service;

import com.nitrourkela.marks.exception.BadRequestException;
import com.nitrourkela.marks.exception.ResourceNotFoundException;
import com.nitrourkela.marks.model.dto.GradeResult;
import com.nitrourkela.marks.model.dto.MarksRequest;
import com.nitrourkela.marks.model.dto.StudentMarksDTO;
import com.nitrourkela.marks.model.entity.*;
import com.nitrourkela.marks.model.enums.AssignmentRole;
import com.nitrourkela.marks.model.enums.MarksStatus;
import com.nitrourkela.marks.repository.*;
import com.nitrourkela.marks.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class MarksService {

    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final SemesterSubjectRepository semesterSubjectRepository;
    private final FacultyRepository facultyRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final GradingService gradingService;

    public MarksService(MarksRepository marksRepository,
                        StudentRepository studentRepository,
                        SemesterSubjectRepository semesterSubjectRepository,
                        FacultyRepository facultyRepository,
                        FacultyAssignmentRepository facultyAssignmentRepository,
                        AuditLogRepository auditLogRepository,
                        GradingService gradingService) {
        this.marksRepository = marksRepository;
        this.studentRepository = studentRepository;
        this.semesterSubjectRepository = semesterSubjectRepository;
        this.facultyRepository = facultyRepository;
        this.facultyAssignmentRepository = facultyAssignmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.gradingService = gradingService;
    }

    private UUID getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }

    @Transactional(readOnly = true)
    public List<StudentMarksDTO> getMarksForSubject(UUID semesterSubjectId) {
        SemesterSubject semesterSubject = semesterSubjectRepository.findById(semesterSubjectId)
                .orElseThrow(() -> new ResourceNotFoundException("SemesterSubject not found"));

        // Get the faculty assignment for current user to determine editability
        UUID currentUserId = getCurrentUserId();
        Optional<FacultyAssignment> assignment = facultyAssignmentRepository
                .findBySemesterSubjectIdAndFacultyId(semesterSubjectId, currentUserId);

        // Get all marks for this subject
        List<Marks> marksList = marksRepository.findBySemesterSubjectId(semesterSubjectId);

        // Build map for fast lookup
        Map<UUID, Marks> marksMap = new HashMap<>();
        for (Marks m : marksList) {
            marksMap.put(m.getStudent().getId(), m);
        }

        // Get all students in same semester and session as this SemesterSubject
        UUID sessionId = semesterSubject.getSemester().getSession().getId();
        int semNumber = semesterSubject.getSemester().getNumber();
        List<Student> students = studentRepository.findBySessionIdAndCurrentSemester(sessionId, semNumber);

        List<StudentMarksDTO> result = new ArrayList<>();
        for (Student student : students) {
            Marks m = marksMap.get(student.getId());
            boolean editable = m == null || m.getStatus() == MarksStatus.DRAFT;
            result.add(new StudentMarksDTO(
                    student.getId(),
                    student.getRollNumber(),
                    student.getName(),
                    student.getDepartment(),
                    m != null ? m.getPreMidMarks() : null,
                    m != null ? m.getPostMidMarks() : null,
                    m != null ? m.getTotalMarks() : null,
                    m != null ? m.getPercentage() : null,
                    m != null ? m.getAutoGrade() : null,
                    m != null ? m.getGradePoint() : null,
                    m != null ? m.getStatus() : MarksStatus.DRAFT,
                    editable
            ));
        }
        return result;
    }

    @Transactional
    public List<Marks> saveBatchMarks(UUID semesterSubjectId, List<MarksRequest> requests) {
        SemesterSubject semesterSubject = semesterSubjectRepository.findById(semesterSubjectId)
                .orElseThrow(() -> new ResourceNotFoundException("SemesterSubject not found"));

        Faculty currentFaculty = facultyRepository.findById(getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Subject subject = semesterSubject.getSubject();
        List<Marks> saved = new ArrayList<>();

        for (MarksRequest req : requests) {
            Student student = studentRepository.findById(req.studentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + req.studentId()));

            // Validate marks against max marks
            if (req.preMidMarks() != null && req.preMidMarks() > subject.getMaxMarksPreMid()) {
                throw new BadRequestException("Pre-Mid marks for student " + student.getRollNumber()
                        + " exceed maximum " + subject.getMaxMarksPreMid());
            }
            if (req.postMidMarks() != null && req.postMidMarks() > subject.getMaxMarksPostMid()) {
                throw new BadRequestException("Post-Mid marks for student " + student.getRollNumber()
                        + " exceed maximum " + subject.getMaxMarksPostMid());
            }
            if (req.preMidMarks() != null && req.preMidMarks() < 0) {
                throw new BadRequestException("Marks cannot be negative for student " + student.getRollNumber());
            }
            if (req.postMidMarks() != null && req.postMidMarks() < 0) {
                throw new BadRequestException("Marks cannot be negative for student " + student.getRollNumber());
            }

            Optional<Marks> existing = marksRepository.findBySemesterSubjectIdAndStudentId(semesterSubjectId, req.studentId());

            if (existing.isPresent() && existing.get().getStatus() == MarksStatus.LOCKED) {
                throw new BadRequestException("Marks for student " + student.getRollNumber() + " are locked and cannot be modified");
            }

            String previousValues = null;
            Marks marks;
            if (existing.isPresent()) {
                marks = existing.get();
                previousValues = "{\"preMid\":" + marks.getPreMidMarks() + ",\"postMid\":" + marks.getPostMidMarks() + "}";
            } else {
                marks = new Marks();
                marks.setStudent(student);
                marks.setSemesterSubject(semesterSubject);
                marks.setStatus(MarksStatus.DRAFT);
            }

            marks.setPreMidMarks(req.preMidMarks());
            marks.setPostMidMarks(req.postMidMarks());
            marks.setEnteredBy(currentFaculty);

            // Auto-compute grade when total marks are available
            if (marks.getPercentage() != null) {
                GradeResult grade = gradingService.calculateGrade(marks.getPercentage());
                marks.setAutoGrade(grade.grade());
                marks.setGradePoint(grade.gradePoint());
            } else {
                marks.setAutoGrade(null);
                marks.setGradePoint(null);
            }

            Marks savedMarks = marksRepository.save(marks);
            saved.add(savedMarks);

            // Audit log
            String newValues = "{\"preMid\":" + marks.getPreMidMarks() + ",\"postMid\":" + marks.getPostMidMarks()
                    + ",\"grade\":\"" + marks.getAutoGrade() + "\"}";
            AuditLog log = new AuditLog(getCurrentUserId(),
                    existing.isPresent() ? "UPDATE" : "CREATE",
                    "Marks", savedMarks.getId(), previousValues, newValues);
            auditLogRepository.save(log);
        }

        return saved;
    }

    @Transactional
    public void submitMarks(UUID semesterSubjectId) {
        List<Marks> marksList = marksRepository.findBySemesterSubjectId(semesterSubjectId);
        if (marksList.isEmpty()) {
            throw new BadRequestException("No marks found to submit for this subject");
        }

        for (Marks marks : marksList) {
            if (marks.getStatus() != MarksStatus.DRAFT) {
                throw new BadRequestException("Only DRAFT marks can be submitted. Found status: " + marks.getStatus());
            }
            marks.setStatus(MarksStatus.SUBMITTED);
            marksRepository.save(marks);

            AuditLog log = new AuditLog(getCurrentUserId(), "STATUS_CHANGE", "Marks", marks.getId(),
                    "{\"status\":\"DRAFT\"}", "{\"status\":\"SUBMITTED\"}");
            auditLogRepository.save(log);
        }
    }

    @Transactional
    public void lockMarks(UUID semesterSubjectId) {
        List<Marks> marksList = marksRepository.findBySemesterSubjectId(semesterSubjectId);
        if (marksList.isEmpty()) {
            throw new BadRequestException("No marks found to lock for this subject");
        }

        for (Marks marks : marksList) {
            if (marks.getStatus() != MarksStatus.SUBMITTED) {
                throw new BadRequestException("Only SUBMITTED marks can be locked. Found status: " + marks.getStatus());
            }
            marks.setStatus(MarksStatus.LOCKED);
            marksRepository.save(marks);

            AuditLog log = new AuditLog(getCurrentUserId(), "STATUS_CHANGE", "Marks", marks.getId(),
                    "{\"status\":\"SUBMITTED\"}", "{\"status\":\"LOCKED\"}");
            auditLogRepository.save(log);
        }
    }

    @Transactional(readOnly = true)
    public double computeSGPA(UUID studentId, UUID semesterId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Marks> marksList = marksRepository.findByStudentId(studentId);

        double totalCredits = 0;
        double weightedSum = 0;

        for (Marks m : marksList) {
            if (!m.getSemesterSubject().getSemester().getId().equals(semesterId)) continue;
            if (m.getGradePoint() == null) continue;

            int credits = m.getSemesterSubject().getSubject().getCredits();
            totalCredits += credits;
            weightedSum += credits * m.getGradePoint();
        }

        if (totalCredits == 0) return 0.0;
        return Math.round((weightedSum / totalCredits) * 100.0) / 100.0;
    }
}
