package com.nitrourkela.marks.repository;

import com.nitrourkela.marks.model.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByEntityAndEntityIdOrderByTimestampDesc(String entity, UUID entityId);
    List<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId);
}
