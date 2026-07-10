package com.nitrourkela.marks.repository;

import com.nitrourkela.marks.model.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByRollNumber(String rollNumber);

    @Query("SELECT s FROM Student s WHERE s.session.id = :sessionId")
    List<Student> findBySessionId(@Param("sessionId") UUID sessionId);

    @Query("SELECT s FROM Student s WHERE s.session.id = :sessionId AND s.currentSemester = :currentSemester")
    List<Student> findBySessionIdAndCurrentSemester(@Param("sessionId") UUID sessionId, @Param("currentSemester") int currentSemester);
}
