package com.nitrourkela.marks.repository;

import com.nitrourkela.marks.model.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarksRepository extends JpaRepository<Marks, UUID> {
    @Query("SELECT m FROM Marks m WHERE m.semesterSubject.id = :semesterSubjectId")
    List<Marks> findBySemesterSubjectId(@Param("semesterSubjectId") UUID semesterSubjectId);

    @Query("SELECT m FROM Marks m WHERE m.semesterSubject.id = :semesterSubjectId AND m.student.id = :studentId")
    Optional<Marks> findBySemesterSubjectIdAndStudentId(@Param("semesterSubjectId") UUID semesterSubjectId, @Param("studentId") UUID studentId);

    @Query("SELECT m FROM Marks m WHERE m.student.id = :studentId")
    List<Marks> findByStudentId(@Param("studentId") UUID studentId);
}
