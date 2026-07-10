package com.nitrourkela.marks.service;

import com.nitrourkela.marks.exception.BadRequestException;
import com.nitrourkela.marks.exception.ResourceNotFoundException;
import com.nitrourkela.marks.model.entity.AcademicSession;
import com.nitrourkela.marks.model.entity.Student;
import com.nitrourkela.marks.repository.AcademicSessionRepository;
import com.nitrourkela.marks.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final AcademicSessionRepository sessionRepository;

    public StudentService(StudentRepository studentRepository, AcademicSessionRepository sessionRepository) {
        this.studentRepository = studentRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Student getStudentById(UUID id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Student> getStudentsBySession(UUID sessionId) {
        return studentRepository.findBySessionId(sessionId);
    }

    @Transactional(readOnly = true)
    public List<Student> getStudentsBySessionAndSemester(UUID sessionId, int semester) {
        return studentRepository.findBySessionIdAndCurrentSemester(sessionId, semester);
    }

    @Transactional
    public Student createStudent(UUID sessionId, Student student) {
        AcademicSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Academic Session not found with id: " + sessionId));

        studentRepository.findByRollNumber(student.getRollNumber()).ifPresent(s -> {
            throw new BadRequestException("Student with Roll Number " + student.getRollNumber() + " already exists");
        });

        student.setSession(session);
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(UUID id, Student details) {
        Student student = getStudentById(id);

        studentRepository.findByRollNumber(details.getRollNumber()).ifPresent(s -> {
            if (!s.getId().equals(id)) {
                throw new BadRequestException("Student with Roll Number " + details.getRollNumber() + " already exists");
            }
        });

        student.setName(details.getName());
        student.setEmail(details.getEmail());
        student.setRollNumber(details.getRollNumber());
        student.setDepartment(details.getDepartment());
        student.setCurrentSemester(details.getCurrentSemester());

        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(UUID id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }

    @Transactional
    public List<Student> importStudents(UUID sessionId, InputStream csvInputStream) {
        AcademicSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Academic Session not found with id: " + sessionId));

        List<Student> students = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvInputStream, StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] data = line.split(",");
                if (isHeader) {
                    isHeader = false;
                    // Check if headers match standard structure roughly, e.g. contains rollNumber
                    continue;
                }

                if (data.length < 5) {
                    throw new BadRequestException("Invalid CSV format on line " + lineNumber + ": expected 5 columns");
                }

                String rollNumber = data[0].trim();
                String name = data[1].trim();
                String email = data[2].trim();
                String department = data[3].trim();
                int currentSemester;
                try {
                    currentSemester = Integer.parseInt(data[4].trim());
                } catch (NumberFormatException e) {
                    throw new BadRequestException("Invalid semester format on line " + lineNumber + ": " + data[4]);
                }

                // If student exists, update them, otherwise create new
                Student student = studentRepository.findByRollNumber(rollNumber)
                        .orElse(new Student());

                student.setRollNumber(rollNumber);
                student.setName(name);
                student.setEmail(email);
                student.setDepartment(department);
                student.setCurrentSemester(currentSemester);
                student.setSession(session);

                students.add(studentRepository.save(student));
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to parse CSV: " + e.getMessage());
        }

        return students;
    }
}
