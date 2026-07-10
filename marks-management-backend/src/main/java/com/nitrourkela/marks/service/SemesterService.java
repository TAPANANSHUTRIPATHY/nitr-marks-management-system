package com.nitrourkela.marks.service;

import com.nitrourkela.marks.exception.BadRequestException;
import com.nitrourkela.marks.exception.ResourceNotFoundException;
import com.nitrourkela.marks.model.entity.AcademicSession;
import com.nitrourkela.marks.model.entity.Semester;
import com.nitrourkela.marks.repository.AcademicSessionRepository;
import com.nitrourkela.marks.repository.SemesterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class SemesterService {

    private final SemesterRepository semesterRepository;
    private final AcademicSessionRepository sessionRepository;

    public SemesterService(SemesterRepository semesterRepository, AcademicSessionRepository sessionRepository) {
        this.semesterRepository = semesterRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public List<Semester> getAllSemesters() {
        return semesterRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Semester> getSemestersBySession(UUID sessionId) {
        return semesterRepository.findBySessionId(sessionId);
    }

    @Transactional(readOnly = true)
    public Semester getSemesterById(UUID id) {
        return semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + id));
    }

    @Transactional
    public Semester createSemester(UUID sessionId, Semester semester) {
        AcademicSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Academic Session not found with id: " + sessionId));

        semesterRepository.findBySessionIdAndNumber(sessionId, semester.getNumber()).ifPresent(s -> {
            throw new BadRequestException("Semester " + semester.getNumber() + " already exists in this session");
        });

        semester.setSession(session);
        return semesterRepository.save(semester);
    }

    @Transactional
    public Semester updateSemester(UUID id, Semester semesterDetails) {
        Semester semester = getSemesterById(id);

        if (semesterDetails.getNumber() != semester.getNumber()) {
            semesterRepository.findBySessionIdAndNumber(semester.getSession().getId(), semesterDetails.getNumber()).ifPresent(s -> {
                throw new BadRequestException("Semester " + semesterDetails.getNumber() + " already exists in this session");
            });
            semester.setNumber(semesterDetails.getNumber());
        }

        semester.setType(semesterDetails.getType());
        semester.setActive(semesterDetails.isActive());

        return semesterRepository.save(semester);
    }

    @Transactional
    public void deleteSemester(UUID id) {
        Semester semester = getSemesterById(id);
        semesterRepository.delete(semester);
    }
}
