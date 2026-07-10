package com.nitrourkela.marks.repository;

import com.nitrourkela.marks.model.entity.SemesterSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SemesterSubjectRepository extends JpaRepository<SemesterSubject, UUID> {
    @Query("SELECT s FROM SemesterSubject s JOIN FETCH s.subject WHERE s.semester.id = :semesterId")
    List<SemesterSubject> findBySemesterId(@Param("semesterId") UUID semesterId);

    @Query("SELECT s FROM SemesterSubject s WHERE s.semester.id = :semesterId AND s.subject.id = :subjectId")
    Optional<SemesterSubject> findBySemesterIdAndSubjectId(@Param("semesterId") UUID semesterId, @Param("subjectId") UUID subjectId);
}
