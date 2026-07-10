package com.nitrourkela.marks.repository;

import com.nitrourkela.marks.model.entity.GradingScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GradingSchemeRepository extends JpaRepository<GradingScheme, UUID> {
    Optional<GradingScheme> findByIsDefaultTrue();
}
