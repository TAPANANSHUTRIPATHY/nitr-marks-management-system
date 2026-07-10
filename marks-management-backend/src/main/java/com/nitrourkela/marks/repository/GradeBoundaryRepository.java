package com.nitrourkela.marks.repository;

import com.nitrourkela.marks.model.entity.GradeBoundary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface GradeBoundaryRepository extends JpaRepository<GradeBoundary, UUID> {
    @Query("SELECT g FROM GradeBoundary g WHERE g.scheme.id = :schemeId")
    List<GradeBoundary> findBySchemeId(@Param("schemeId") UUID schemeId);
}
