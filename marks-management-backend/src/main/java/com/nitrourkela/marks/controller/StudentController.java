package com.nitrourkela.marks.controller;

import com.nitrourkela.marks.model.entity.Student;
import com.nitrourkela.marks.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable UUID id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/sessions/{sessionId}/students")
    public ResponseEntity<List<Student>> getStudentsBySession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(studentService.getStudentsBySession(sessionId));
    }

    @GetMapping("/sessions/{sessionId}/semesters/{semester}/students")
    public ResponseEntity<List<Student>> getStudentsBySessionAndSemester(@PathVariable UUID sessionId, @PathVariable int semester) {
        return ResponseEntity.ok(studentService.getStudentsBySessionAndSemester(sessionId, semester));
    }

    @PostMapping("/sessions/{sessionId}/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> createStudent(@PathVariable UUID sessionId, @Valid @RequestBody Student student) {
        return new ResponseEntity<>(studentService.createStudent(sessionId, student), HttpStatus.CREATED);
    }

    @PutMapping("/students/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> updateStudent(@PathVariable UUID id, @Valid @RequestBody Student details) {
        return ResponseEntity.ok(studentService.updateStudent(id, details));
    }

    @DeleteMapping("/students/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // CSV Bulk Import
    @PostMapping("/sessions/{sessionId}/students/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Student>> importStudents(@PathVariable UUID sessionId, @RequestParam("file") MultipartFile file) {
        try {
            List<Student> imported = studentService.importStudents(sessionId, file.getInputStream());
            return ResponseEntity.ok(imported);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
