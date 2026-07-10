package com.nitrourkela.marks.service;

import com.nitrourkela.marks.exception.ResourceNotFoundException;
import com.nitrourkela.marks.model.dto.StudentReportDTO;
import com.nitrourkela.marks.model.entity.Marks;
import com.nitrourkela.marks.model.entity.Semester;
import com.nitrourkela.marks.model.entity.SemesterSubject;
import com.nitrourkela.marks.model.entity.Student;
import com.nitrourkela.marks.repository.MarksRepository;
import com.nitrourkela.marks.repository.SemesterRepository;
import com.nitrourkela.marks.repository.SemesterSubjectRepository;
import com.nitrourkela.marks.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ReportService {

    private final StudentRepository studentRepository;
    private final SemesterRepository semesterRepository;
    private final SemesterSubjectRepository semesterSubjectRepository;
    private final MarksRepository marksRepository;
    private final MarksService marksService;

    public ReportService(StudentRepository studentRepository,
                         SemesterRepository semesterRepository,
                         SemesterSubjectRepository semesterSubjectRepository,
                         MarksRepository marksRepository,
                         MarksService marksService) {
        this.studentRepository = studentRepository;
        this.semesterRepository = semesterRepository;
        this.semesterSubjectRepository = semesterSubjectRepository;
        this.marksRepository = marksRepository;
        this.marksService = marksService;
    }

    @Transactional(readOnly = true)
    public StudentReportDTO getStudentReport(UUID studentId, UUID semesterId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found"));

        List<SemesterSubject> semSubjects = semesterSubjectRepository.findBySemesterId(semesterId);
        List<Marks> marksList = marksRepository.findByStudentId(studentId);

        Map<UUID, Marks> marksMap = new HashMap<>();
        for (Marks m : marksList) {
            marksMap.put(m.getSemesterSubject().getId(), m);
        }

        List<StudentReportDTO.SubjectMarkDetail> details = new ArrayList<>();
        for (SemesterSubject ss : semSubjects) {
            Marks m = marksMap.get(ss.getId());
            details.add(new StudentReportDTO.SubjectMarkDetail(
                    ss.getSubject().getCode(),
                    ss.getSubject().getName(),
                    ss.getSubject().getCredits(),
                    m != null ? m.getPreMidMarks() : null,
                    m != null ? m.getPostMidMarks() : null,
                    m != null ? m.getTotalMarks() : null,
                    m != null ? m.getAutoGrade() : "N/A",
                    m != null ? m.getGradePoint() : 0.0
            ));
        }

        double sgpa = marksService.computeSGPA(studentId, semesterId);

        return new StudentReportDTO(
                student.getId(),
                student.getRollNumber(),
                student.getName(),
                student.getDepartment(),
                semester.getNumber(),
                details,
                sgpa
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getGradeDistribution(UUID semesterSubjectId) {
        List<Marks> marksList = marksRepository.findBySemesterSubjectId(semesterSubjectId);
        Map<String, Long> distribution = new LinkedHashMap<>();
        
        // Initialize all standard grades with 0 count
        distribution.put("O", 0L);
        distribution.put("E", 0L);
        distribution.put("A", 0L);
        distribution.put("B", 0L);
        distribution.put("C", 0L);
        distribution.put("D", 0L);
        distribution.put("F", 0L);

        for (Marks m : marksList) {
            String grade = m.getAutoGrade();
            if (grade != null && distribution.containsKey(grade)) {
                distribution.put(grade, distribution.get(grade) + 1);
            }
        }
        return distribution;
    }
}
