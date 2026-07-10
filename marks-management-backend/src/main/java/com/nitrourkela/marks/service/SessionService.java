package com.nitrourkela.marks.service;

import com.nitrourkela.marks.exception.BadRequestException;
import com.nitrourkela.marks.exception.ResourceNotFoundException;
import com.nitrourkela.marks.model.entity.AcademicSession;
import com.nitrourkela.marks.repository.AcademicSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class SessionService {

    private final AcademicSessionRepository sessionRepository;

    public SessionService(AcademicSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademicSession> getAllSessions() {
        return sessionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public AcademicSession getSessionById(UUID id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic Session not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public AcademicSession getActiveSession() {
        return sessionRepository.findByIsActiveTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No active academic session found"));
    }

    @Transactional
    public AcademicSession createSession(AcademicSession session) {
        sessionRepository.findByName(session.getName()).ifPresent(s -> {
            throw new BadRequestException("Academic Session with name " + session.getName() + " already exists");
        });

        if (session.isActive()) {
            deactivateAllSessions();
        }
        return sessionRepository.save(session);
    }

    @Transactional
    public AcademicSession updateSession(UUID id, AcademicSession sessionDetails) {
        AcademicSession session = getSessionById(id);
        
        sessionRepository.findByName(sessionDetails.getName()).ifPresent(s -> {
            if (!s.getId().equals(id)) {
                throw new BadRequestException("Academic Session with name " + sessionDetails.getName() + " already exists");
            }
        });

        session.setName(sessionDetails.getName());
        session.setStartDate(sessionDetails.getStartDate());
        session.setEndDate(sessionDetails.getEndDate());

        if (sessionDetails.isActive() && !session.isActive()) {
            deactivateAllSessions();
            session.setActive(true);
        } else if (!sessionDetails.isActive() && session.isActive()) {
            // Cannot deactivate if it's the only active one unless required, but let's allow it
            session.setActive(false);
        }

        return sessionRepository.save(session);
    }

    @Transactional
    public void deleteSession(UUID id) {
        AcademicSession session = getSessionById(id);
        sessionRepository.delete(session);
    }

    private void deactivateAllSessions() {
        List<AcademicSession> activeSessions = sessionRepository.findAll();
        for (AcademicSession session : activeSessions) {
            if (session.isActive()) {
                session.setActive(false);
                sessionRepository.save(session);
            }
        }
    }
}
