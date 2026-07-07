# Database Schema Design - NIT Rourkela Marks Management System

This document outlines the database design for the Marks Management System. To fulfill B.Tech academic standards, we provide both a **Relational Schema (SQL DDL)** and a **NoSQL Schema (Firebase Firestore)** representation.

---

## 1. Relational Database Design (SQL DDL)

Below are the standard SQL commands to initialize the schema. They demonstrate proper primary key constraints, foreign key mappings, and table relations.

```sql
-- 1. Academic Sessions Table
CREATE TABLE academic_sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    session_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE
);

-- 2. Semesters Table
CREATE TABLE semesters (
    semester_id VARCHAR(50) PRIMARY KEY,
    semester_name VARCHAR(50) NOT NULL,
    session_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (session_id) REFERENCES academic_sessions(session_id) ON DELETE CASCADE
);

-- 3. Faculty Table (Admins & Lecturers)
CREATE TABLE faculty (
    faculty_id VARCHAR(50) PRIMARY KEY,
    faculty_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Admin', 'Course Coordinator', 'Sub-Coordinator')),
    department VARCHAR(100) NOT NULL
);

-- 4. Subjects Table
CREATE TABLE subjects (
    subject_id VARCHAR(50) PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_title VARCHAR(150) NOT NULL,
    credits INT CHECK (credits BETWEEN 1 AND 6),
    semester_id VARCHAR(50) NOT NULL,
    coordinator_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    FOREIGN KEY (coordinator_id) REFERENCES faculty(faculty_id)
);

-- 5. Sub-Coordinator Mapping Table (Many-to-Many relation)
CREATE TABLE subject_sub_coordinators (
    subject_id VARCHAR(50) NOT NULL,
    faculty_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (subject_id, faculty_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
);

-- 6. Students Table
CREATE TABLE students (
    roll_number VARCHAR(20) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    branch VARCHAR(50) NOT NULL,
    semester_id VARCHAR(50) NOT NULL,
    section CHAR(1) NOT NULL CHECK (section IN ('A', 'B', 'C', 'D')),
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
);

-- 7. Marks Records Table
CREATE TABLE marks_records (
    record_id VARCHAR(50) PRIMARY KEY,
    student_roll VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    pre_mid_marks DECIMAL(5,2) CHECK (pre_mid_marks BETWEEN 0 AND 30),
    post_mid_marks DECIMAL(5,2) CHECK (post_mid_marks BETWEEN 0 AND 70),
    total_marks DECIMAL(5,2) GENERATED ALWAYS AS (pre_mid_marks + post_mid_marks) STORED,
    letter_grade CHAR(2) NOT NULL,
    FOREIGN KEY (student_roll) REFERENCES students(roll_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE
);
```

### Relational Entity Relationships (ERD Mapping)
- `academic_sessions` (1) &rarr; (&infin;) `semesters` (One-to-Many)
- `semesters` (1) &rarr; (&infin;) `subjects` (One-to-Many)
- `semesters` (1) &rarr; (&infin;) `students` (One-to-Many)
- `faculty` (1) &rarr; (&infin;) `subjects` (One-to-Many as primary Course Coordinator)
- `subjects` (&infin;) &harr; (&infin;) `faculty` (Many-to-Many via `subject_sub_coordinators` mapping)
- `students` (1) &rarr; (&infin;) `marks_records` (One-to-Many)
- `subjects` (1) &rarr; (&infin;) `marks_records` (One-to-Many)

---

## 2. Firebase Firestore Database Schema

Firestore is a document-oriented NoSQL database organized into collections. Documents within collections contain key-value mappings. Below is our database topology.

### Collection: `sessions`
```json
{
  "_id": "sess-2",
  "name": "Spring Semester 2025-26",
  "isActive": true
}
```

### Collection: `semesters`
```json
{
  "_id": "sem-5",
  "name": "5th Semester",
  "sessionId": "sess-2"
}
```

### Collection: `faculty`
```json
{
  "_id": "fac-cc1",
  "name": "Dr. Ramesh Chandra",
  "email": "cc1@nitrkl.ac.in",
  "role": "Course Coordinator",
  "department": "Computer Science & Engineering"
}
```

### Collection: `subjects`
```json
{
  "_id": "subj-1",
  "code": "CS-301",
  "name": "Database Management Systems",
  "credits": 4,
  "semesterId": "sem-5",
  "coordinatorId": "fac-cc1",
  "subCoordinators": [
    "fac-sc1",
    "fac-sc2"
  ]
}
```

### Collection: `students`
```json
{
  "_id": "122CS0101",
  "rollNumber": "122CS0101",
  "name": "Aarav Sharma",
  "email": "122cs0101@nitrkl.ac.in",
  "branch": "CSE",
  "semesterId": "sem-5",
  "section": "A"
}
```

### Collection: `marks`
```json
{
  "_id": "m-122CS0101-CS-301",
  "studentRoll": "122CS0101",
  "subjectCode": "CS-301",
  "preMid": 24,
  "postMid": 62,
  "total": 86,
  "grade": "A"
}
```
