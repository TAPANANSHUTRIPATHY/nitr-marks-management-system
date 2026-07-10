package com.nitrourkela.marks.repository;

import com.nitrourkela.marks.model.entity.FacultyAssignment;
import com.nitrourkela.marks.model.enums.AssignmentRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacultyAssignmentRepository extends JpaRepository<FacultyAssignment, UUID> {
    @Query("SELECT f FROM FacultyAssignment f WHERE f.faculty.id = :facultyId")
    List<FacultyAssignment> findByFacultyId(@Param("facultyId") UUID facultyId);

    @Query("SELECT f FROM FacultyAssignment f WHERE f.semesterSubject.id = :semesterSubjectId")
    List<FacultyAssignment> findBySemesterSubjectId(@Param("semesterSubjectId") UUID semesterSubjectId);

    @Query("SELECT f FROM FacultyAssignment f WHERE f.semesterSubject.id = :semesterSubjectId AND f.faculty.id = :facultyId")
    Optional<FacultyAssignment> findBySemesterSubjectIdAndFacultyId(@Param("semesterSubjectId") UUID semesterSubjectId, @Param("facultyId") UUID facultyId);

    @Query("SELECT f FROM FacultyAssignment f WHERE f.semesterSubject.id = :semesterSubjectId AND f.assignmentRole = :assignmentRole")
    List<FacultyAssignment> findBySemesterSubjectIdAndAssignmentRole(@Param("semesterSubjectId") UUID semesterSubjectId, @Param("assignmentRole") AssignmentRole assignmentRole);

    @Query("SELECT f FROM FacultyAssignment f WHERE f.semesterSubject.id = :semesterSubjectId AND f.faculty.id = :facultyId AND f.assignmentRole = :assignmentRole")
    Optional<FacultyAssignment> findBySemesterSubjectIdAndFacultyIdAndAssignmentRole(@Param("semesterSubjectId") UUID semesterSubjectId, @Param("facultyId") UUID facultyId, @Param("assignmentRole") AssignmentRole assignmentRole);
}
