package com.nitrourkela.marks.service;

import com.nitrourkela.marks.exception.BadRequestException;
import com.nitrourkela.marks.exception.ResourceNotFoundException;
import com.nitrourkela.marks.model.entity.Semester;
import com.nitrourkela.marks.model.entity.SemesterSubject;
import com.nitrourkela.marks.model.entity.Subject;
import com.nitrourkela.marks.repository.SemesterRepository;
import com.nitrourkela.marks.repository.SemesterSubjectRepository;
import com.nitrourkela.marks.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;
    private final SemesterSubjectRepository semesterSubjectRepository;

    public SubjectService(SubjectRepository subjectRepository, SemesterRepository semesterRepository, 
                          SemesterSubjectRepository semesterSubjectRepository) {
        this.subjectRepository = subjectRepository;
        this.semesterRepository = semesterRepository;
        this.semesterSubjectRepository = semesterSubjectRepository;
    }

    @Transactional(readOnly = true)
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Subject getSubjectById(UUID id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
    }

    @Transactional
    public Subject createSubject(Subject subject) {
        subjectRepository.findByCode(subject.getCode()).ifPresent(s -> {
            throw new BadRequestException("Subject with code " + subject.getCode() + " already exists");
        });
        return subjectRepository.save(subject);
    }

    @Transactional
    public Subject updateSubject(UUID id, Subject subjectDetails) {
        Subject subject = getSubjectById(id);

        subjectRepository.findByCode(subjectDetails.getCode()).ifPresent(s -> {
            if (!s.getId().equals(id)) {
                throw new BadRequestException("Subject with code " + subjectDetails.getCode() + " already exists");
            }
        });

        subject.setCode(subjectDetails.getCode());
        subject.setName(subjectDetails.getName());
        subject.setCredits(subjectDetails.getCredits());
        subject.setMaxMarksPreMid(subjectDetails.getMaxMarksPreMid());
        subject.setMaxMarksPostMid(subjectDetails.getMaxMarksPostMid());

        return subjectRepository.save(subject);
    }

    @Transactional
    public void deleteSubject(UUID id) {
        Subject subject = getSubjectById(id);
        subjectRepository.delete(subject);
    }

    @Transactional
    public SemesterSubject mapSubjectToSemester(UUID semesterId, UUID subjectId) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + semesterId));
        
        Subject subject = getSubjectById(subjectId);

        semesterSubjectRepository.findBySemesterIdAndSubjectId(semesterId, subjectId).ifPresent(ss -> {
            throw new BadRequestException("Subject is already mapped to this semester");
        });

        SemesterSubject semesterSubject = new SemesterSubject(semester, subject);
        return semesterSubjectRepository.save(semesterSubject);
    }

    @Transactional(readOnly = true)
    public List<SemesterSubject> getSemesterSubjects(UUID semesterId) {
        return semesterSubjectRepository.findBySemesterId(semesterId);
    }

    @Transactional
    public void unmapSubjectFromSemester(UUID semesterId, UUID subjectId) {
        SemesterSubject ss = semesterSubjectRepository.findBySemesterIdAndSubjectId(semesterId, subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Mapping not found for semester " + semesterId + " and subject " + subjectId));
        semesterSubjectRepository.delete(ss);
    }
}
