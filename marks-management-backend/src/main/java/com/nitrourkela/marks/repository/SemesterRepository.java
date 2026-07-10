package com.nitrourkela.marks.repository;

import com.nitrourkela.marks.model.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, UUID> {
    @Query("SELECT s FROM Semester s WHERE s.session.id = :sessionId")
    List<Semester> findBySessionId(@Param("sessionId") UUID sessionId);

    @Query("SELECT s FROM Semester s WHERE s.session.id = :sessionId AND s.number = :number")
    Optional<Semester> findBySessionIdAndNumber(@Param("sessionId") UUID sessionId, @Param("number") int number);
}
