import sqlite3
import os
import hashlib
import random

DB_NAME = "acadtrack.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# --- Security & Password Hashing ---
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    db_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ":" + db_hash.hex()

def verify_password(stored_password: str, provided_password: str) -> bool:
    try:
        salt_hex, hash_hex = stored_password.split(":")
        salt = bytes.fromhex(salt_hex)
        expected_hash = bytes.fromhex(hash_hex)
        db_hash = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
        return db_hash == expected_hash
    except Exception:
        return False

# --- Auto Grade Calculation ---
def calculate_grade(total_marks: float) -> str:
    if total_marks >= 90:
        return "Ex" # Excellent
    elif total_marks >= 80:
        return "A"
    elif total_marks >= 70:
        return "B"
    elif total_marks >= 60:
        return "C"
    elif total_marks >= 50:
        return "D"
    elif total_marks >= 40:
        return "P" # Pass
    else:
        return "F" # Fail

# --- Database Schema and Seeding ---
def initialize_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create Tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL, -- 'Head of the Department', 'Coordinator', 'Student'
        full_name TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS programs (
        id TEXT PRIMARY KEY, -- 'BTECH', 'MTECH', 'PHD'
        name TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS coordinators (
        user_id INTEGER PRIMARY KEY,
        program_id TEXT NOT NULL,
        department TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(program_id) REFERENCES programs(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subjects (
        code TEXT PRIMARY KEY, -- e.g., 'CS-201'
        name TEXT NOT NULL,
        program_id TEXT NOT NULL,
        coordinator_id INTEGER NOT NULL,
        FOREIGN KEY(program_id) REFERENCES programs(id),
        FOREIGN KEY(coordinator_id) REFERENCES users(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        roll_number TEXT PRIMARY KEY, -- e.g., '125CS0001'
        user_id INTEGER UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        program_id TEXT NOT NULL,
        department TEXT NOT NULL,
        semester INTEGER NOT NULL,
        email TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(program_id) REFERENCES programs(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS marks (
        student_roll TEXT NOT NULL,
        subject_code TEXT NOT NULL,
        session TEXT NOT NULL, -- e.g., '2025-2026'
        semester INTEGER NOT NULL,
        pre_mid_marks REAL CHECK(pre_mid_marks >= 0 AND pre_mid_marks <= 50),
        post_mid_marks REAL CHECK(post_mid_marks >= 0 AND post_mid_marks <= 50),
        total_marks REAL,
        grade TEXT,
        updated_by INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(student_roll, subject_code, session, semester),
        FOREIGN KEY(student_roll) REFERENCES students(roll_number) ON DELETE CASCADE,
        FOREIGN KEY(subject_code) REFERENCES subjects(code) ON DELETE CASCADE,
        FOREIGN KEY(updated_by) REFERENCES users(id)
    );
    """)

    conn.commit()

    # Check if programs already initialized, if so, skip seeding
    cursor.execute("SELECT COUNT(*) FROM programs")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    print("Database empty. Seeding academic records...")

    # Seed Programs
    cursor.executemany("INSERT INTO programs (id, name) VALUES (?, ?)", [
        ('BTECH', 'B.Tech'),
        ('MTECH', 'M.Tech'),
        ('PHD', 'PhD')
    ])

    # Seed Head of the Department
    admin_pw = hash_password("admin123")
    cursor.execute("""
        INSERT INTO users (username, password_hash, role, full_name) 
        VALUES ('sdhawan', ?, 'Head of the Department', 'Prof. Satish Dhawan')
    """, (admin_pw,))
    
    # Also support general 'admin' login
    cursor.execute("""
        INSERT INTO users (username, password_hash, role, full_name) 
        VALUES ('admin', ?, 'Head of the Department', 'Prof. Satish Dhawan')
    """, (admin_pw,))

    # Seed Coordinators
    coordinators_data = [
        ('ramesh', 'coord123', 'Dr. Ramesh Kumar', 'BTECH', 'Computer Science & Engineering'),
        ('sunita', 'coord123', 'Dr. Sunita Sharma', 'BTECH', 'Electronics & Communication Engineering'),
        ('amit', 'coord123', 'Dr. Amit Patel', 'MTECH', 'Mechanical Engineering'),
        ('rajesh', 'coord123', 'Dr. Rajesh Sen', 'PHD', 'Biotechnology')
    ]

    coord_ids = {}
    for username, pw, name, prog, dept in coordinators_data:
        h_pw = hash_password(pw)
        cursor.execute("""
            INSERT INTO users (username, password_hash, role, full_name)
            VALUES (?, ?, 'Coordinator', ?)
        """, (username, h_pw, name))
        user_id = cursor.lastrowid
        cursor.execute("""
            INSERT INTO coordinators (user_id, program_id, department)
            VALUES (?, ?, ?)
        """, (user_id, prog, dept))
        coord_ids[username] = user_id

    # Seed Subjects
    subjects_data = [
        ('CS-201', 'Data Structures', 'BTECH', coord_ids['ramesh']),
        ('CS-202', 'Computer Organization', 'BTECH', coord_ids['ramesh']),
        ('EC-201', 'Signals and Systems', 'BTECH', coord_ids['sunita']),
        ('EC-202', 'Digital Electronics', 'BTECH', coord_ids['sunita']),
        ('ME-501', 'Finite Element Method', 'MTECH', coord_ids['amit']),
        ('ME-502', 'Advanced Thermodynamics', 'MTECH', coord_ids['amit']),
        ('BT-701', 'Research Methodology', 'PHD', coord_ids['rajesh']),
        ('BT-702', 'Advanced Biotechnology', 'PHD', coord_ids['rajesh'])
    ]
    cursor.executemany("""
        INSERT INTO subjects (code, name, program_id, coordinator_id)
        VALUES (?, ?, ?, ?)
    """, subjects_data)

    # 60 Students Seeding List
    btech_names = [
        "Amit Kumar", "Priyanshu Sharma", "Sneha Patel", "Rahul Verma", "Abhishek Singh",
        "Jyoti Gupta", "Divya Raj", "Manish Choudhury", "Ankit Mishra", "Pooja Das",
        "Rohit Sengupta", "Shreya Rao", "Saurav Mohanty", "Neha Nair", "Vivek Saxena",
        "Riya Sen", "Aditya Jha", "Tanvi Reddy", "Akash Dutta", "Kirti Joshi"
    ]
    mtech_names = [
        "Rajesh Mohapatra", "Subhashree Dash", "Debasish Pradhan", "Lipsa Priyadarshini", "Chinmayee Sahoo",
        "Sourav Behera", "Sagarika Jena", "Asutosh Tripathy", "Bandita Swain", "Pritam Nayak",
        "Swapna Rani Das", "Tapas Kumar", "Monalisa Patra", "Satyabrata Rout", "Rashmirekha Panda",
        "Biswajit Mishra", "Pragyan Paramita", "Sandeep Sahu", "Subhalaxmi Rout", "Alok Ranjan"
    ]
    phd_names = [
        "Sonali Panda", "Arpan Kar", "Rasmita Behura", "Manoj Panigrahi", "Suchitra Senapati",
        "Bikash Samal", "Madhusmita Acharya", "Deepak Padhi", "Padmini Panigrahi", "Rudra Prasad",
        "Swarnalata Devi", "Abinash Kar", "Nibedita Sahu", "Gagan Bihari", "Lopamudra Muduli",
        "Santosh Mohanty", "Priyabrata Dash", "Archana Das", "Ashis Mohapatra", "Nibedita Tripathy"
    ]

    student_pw = hash_password("student123")

    # Helper function to seed program students
    def seed_students_for_program(names, prog_id, dept, roll_prefix, start_sem):
        for i, name in enumerate(names, 1):
            roll_number = f"{roll_prefix}{i:04d}"
            # Create user login
            cursor.execute("""
                INSERT INTO users (username, password_hash, role, full_name)
                VALUES (?, ?, 'Student', ?)
            """, (roll_number, student_pw, name))
            user_id = cursor.lastrowid
            
            # Create student record
            email = f"{roll_number.lower()}@nitrkl.ac.in"
            cursor.execute("""
                INSERT INTO students (roll_number, user_id, full_name, program_id, department, semester, email)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (roll_number, user_id, name, prog_id, dept, start_sem, email))

    # Seed Students
    seed_students_for_program(btech_names, "BTECH", "Computer Science & Engineering", "125CS", 3)
    seed_students_for_program(mtech_names, "MTECH", "Mechanical Engineering", "225ME", 1)
    seed_students_for_program(phd_names, "PHD", "Biotechnology", "325BT", 1)

    # Seed Sample Marks (Pre Mid max 50, Post Mid max 50)
    cursor.execute("SELECT roll_number, program_id, semester FROM students")
    students = cursor.fetchall()

    for student in students:
        roll = student['roll_number']
        prog = student['program_id']
        sem = student['semester']

        # Get subjects for this program
        cursor.execute("SELECT code, coordinator_id FROM subjects WHERE program_id = ?", (prog,))
        subjs = cursor.fetchall()

        for subj in subjs:
            code = subj['code']
            coord_id = subj['coordinator_id']

            # Make grading slightly random but realistic
            pre_mid = round(random.uniform(20.0, 48.0), 1)
            post_mid = round(random.uniform(20.0, 48.0), 1)
            total = pre_mid + post_mid
            grade = calculate_grade(total)

            cursor.execute("""
                INSERT INTO marks (student_roll, subject_code, session, semester, pre_mid_marks, post_mid_marks, total_marks, grade, updated_by)
                VALUES (?, ?, '2025-2026', ?, ?, ?, ?, ?, ?)
            """, (roll, code, sem, pre_mid, post_mid, total, grade, coord_id))

    conn.commit()
    conn.close()
    print("Database seeding completed successfully.")

# --- API Data Helpers ---

def verify_user(username, password):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    if user and verify_password(user['password_hash'], password):
        details = dict(user)
        del details['password_hash']
        return details
    return None

def get_user_role_details(user_id, role):
    conn = get_db_connection()
    details = {}
    if role == 'Coordinator':
        row = conn.execute("""
            SELECT c.*, p.name as program_name FROM coordinators c
            JOIN programs p ON c.program_id = p.id
            WHERE c.user_id = ?
        """, (user_id,)).fetchone()
        if row:
            details = dict(row)
    elif role == 'Student':
        row = conn.execute("""
            SELECT s.*, p.name as program_name FROM students s
            JOIN programs p ON s.program_id = p.id
            WHERE s.user_id = ?
        """, (user_id,)).fetchone()
        if row:
            details = dict(row)
    conn.close()
    return details

def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM students")
    total_students = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM subjects")
    total_subjects = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM coordinators")
    total_coordinators = cursor.fetchone()[0]

    cursor.execute("""
        SELECT s.program_id, AVG(m.total_marks) as avg_marks
        FROM marks m
        JOIN students s ON m.student_roll = s.roll_number
        GROUP BY s.program_id
    """)
    program_averages = {row['program_id']: round(row['avg_marks'], 2) for row in cursor.fetchall()}

    cursor.execute("""
        SELECT s.roll_number, s.full_name, s.program_id, AVG(m.total_marks) as gpa
        FROM marks m
        JOIN students s ON m.student_roll = s.roll_number
        GROUP BY s.roll_number, s.full_name, s.program_id
        ORDER BY gpa DESC
        LIMIT 5
    """)
    top_performers = [dict(row) for row in cursor.fetchall()]

    cursor.execute("""
        SELECT grade, COUNT(*) as count
        FROM marks
        GROUP BY grade
        ORDER BY 
            CASE grade 
                WHEN 'Ex' THEN 1
                WHEN 'A' THEN 2
                WHEN 'B' THEN 3
                WHEN 'C' THEN 4
                WHEN 'D' THEN 5
                WHEN 'P' THEN 6
                WHEN 'F' THEN 7
            END
    """)
    grade_distribution = {row['grade']: row['count'] for row in cursor.fetchall()}

    conn.close()

    return {
        "total_students": total_students,
        "total_subjects": total_subjects,
        "total_coordinators": total_coordinators,
        "program_averages": program_averages,
        "top_performers": top_performers,
        "grade_distribution": grade_distribution
    }

def get_students(program_id=None, search_query=None):
    conn = get_db_connection()
    query = """
        SELECT s.*, p.name as program_name, u.username
        FROM students s
        JOIN programs p ON s.program_id = p.id
        JOIN users u ON s.user_id = u.id
    """
    params = []
    conditions = []

    if program_id:
        conditions.append("s.program_id = ?")
        params.append(program_id)
    
    if search_query:
        conditions.append("(s.full_name LIKE ? OR s.roll_number LIKE ? OR s.department LIKE ?)")
        search_param = f"%{search_query}%"
        params.extend([search_param, search_param, search_param])

    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY s.roll_number ASC"
    
    students = [dict(row) for row in conn.execute(query, params).fetchall()]
    conn.close()
    return students

def get_subjects(program_id=None):
    conn = get_db_connection()
    query = """
        SELECT s.*, u.full_name as coordinator_name, p.name as program_name
        FROM subjects s
        JOIN users u ON s.coordinator_id = u.id
        JOIN programs p ON s.program_id = p.id
    """
    params = []
    if program_id:
        query += " WHERE s.program_id = ?"
        params.append(program_id)
        
    subjects = [dict(row) for row in conn.execute(query, params).fetchall()]
    conn.close()
    return subjects

def get_student_report_card(roll_number):
    conn = get_db_connection()
    
    student = conn.execute("""
        SELECT s.*, p.name as program_name
        FROM students s
        JOIN programs p ON s.program_id = p.id
        WHERE s.roll_number = ?
    """, (roll_number,)).fetchone()
    
    if not student:
        conn.close()
        return None

    marks = conn.execute("""
        SELECT m.*, sub.name as subject_name, u.full_name as coordinator_name
        FROM marks m
        JOIN subjects sub ON m.subject_code = sub.code
        JOIN users u ON m.updated_by = u.id
        WHERE m.student_roll = ?
        ORDER BY sub.code ASC
    """, (roll_number,)).fetchall()
    
    conn.close()
    return {
        "student": dict(student),
        "marks": [dict(row) for row in marks]
    }

def get_coordinator_students_marks(coordinator_user_id, search_query=None):
    conn = get_db_connection()
    
    coord = conn.execute("SELECT * FROM coordinators WHERE user_id = ?", (coordinator_user_id,)).fetchone()
    if not coord:
        conn.close()
        return []
    
    program_id = coord['program_id']
    
    query = """
        SELECT s.roll_number, s.full_name, s.department, s.semester,
               sub.code as subject_code, sub.name as subject_name,
               m.pre_mid_marks, m.post_mid_marks, m.total_marks, m.grade, m.session
        FROM students s
        CROSS JOIN subjects sub ON sub.program_id = s.program_id
        LEFT JOIN marks m ON s.roll_number = m.student_roll AND sub.code = m.subject_code
        WHERE s.program_id = ? AND sub.coordinator_id = ?
    """
    params = [program_id, coordinator_user_id]
    
    if search_query:
        query += " AND (s.full_name LIKE ? OR s.roll_number LIKE ?)"
        search_param = f"%{search_query}%"
        params.extend([search_param, search_param])
        
    query += " ORDER BY s.roll_number ASC, sub.code ASC"
    
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_marks(student_roll, subject_code, session, semester, pre_mid, post_mid, coordinator_id):
    if not (0 <= pre_mid <= 50):
        raise ValueError("Pre Mid-Semester marks must be between 0 and 50.")
    if not (0 <= post_mid <= 50):
        raise ValueError("Post Mid-Semester marks must be between 0 and 50.")

    total_marks = pre_mid + post_mid
    grade = calculate_grade(total_marks)

    conn = get_db_connection()
    cursor = conn.cursor()
    
    student = cursor.execute("SELECT program_id FROM students WHERE roll_number = ?", (student_roll,)).fetchone()
    subject = cursor.execute("SELECT program_id, coordinator_id FROM subjects WHERE code = ?", (subject_code,)).fetchone()
    
    if not student:
        conn.close()
        raise ValueError(f"Student with roll number {student_roll} does not exist.")
    if not subject:
        conn.close()
        raise ValueError(f"Subject code {subject_code} does not exist.")
    if student['program_id'] != subject['program_id']:
        conn.close()
        raise ValueError(f"Student program ({student['program_id']}) doesn't match subject program ({subject['program_id']}).")
    
    user = cursor.execute("SELECT role FROM users WHERE id = ?", (coordinator_id,)).fetchone()
    if user['role'] != 'Head of the Department' and subject['coordinator_id'] != coordinator_id:
        conn.close()
        raise PermissionError("You are not authorized to update marks for this subject.")

    cursor.execute("""
        INSERT INTO marks (student_roll, subject_code, session, semester, pre_mid_marks, post_mid_marks, total_marks, grade, updated_by, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(student_roll, subject_code, session, semester) DO UPDATE SET
            pre_mid_marks = excluded.pre_mid_marks,
            post_mid_marks = excluded.post_mid_marks,
            total_marks = excluded.total_marks,
            grade = excluded.grade,
            updated_by = excluded.updated_by,
            updated_at = CURRENT_TIMESTAMP
    """, (student_roll, subject_code, session, semester, pre_mid, post_mid, total_marks, grade, coordinator_id))
    
    conn.commit()
    conn.close()
    return {
        "pre_mid_marks": pre_mid,
        "post_mid_marks": post_mid,
        "total_marks": total_marks,
        "grade": grade
    }

def get_coordinators():
    conn = get_db_connection()
    query = """
        SELECT u.id, u.username, u.full_name, c.program_id, c.department, p.name as program_name
        FROM coordinators c
        JOIN users u ON c.user_id = u.id
        JOIN programs p ON c.program_id = p.id
        ORDER BY u.id ASC
    """
    rows = conn.execute(query).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_coordinator(username, password, full_name, program_id, department):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        pw_hash = hash_password(password)
        cursor.execute("""
            INSERT INTO users (username, password_hash, role, full_name)
            VALUES (?, ?, 'Coordinator', ?)
        """, (username, pw_hash, full_name))
        user_id = cursor.lastrowid
        
        cursor.execute("""
            INSERT INTO coordinators (user_id, program_id, department)
            VALUES (?, ?, ?)
        """, (user_id, program_id, department))
        
        conn.commit()
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        raise ValueError(f"Username '{username}' already exists.")
    except Exception as e:
        conn.close()
        raise e

def delete_coordinator(coordinator_user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        subjects_count = cursor.execute("SELECT COUNT(*) FROM subjects WHERE coordinator_id = ?", (coordinator_user_id,)).fetchone()[0]
        if subjects_count > 0:
            conn.close()
            raise ValueError("Cannot delete coordinator. They are currently assigned to one or more subjects. Reassign the subjects first.")

        cursor.execute("DELETE FROM coordinators WHERE user_id = ?", (coordinator_user_id,))
        cursor.execute("DELETE FROM users WHERE id = ?", (coordinator_user_id,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        conn.close()
        raise e

def add_student(roll_number, full_name, program_id, department, semester, email, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        pw_hash = hash_password(password)
        cursor.execute("""
            INSERT INTO users (username, password_hash, role, full_name)
            VALUES (?, ?, 'Student', ?)
        """, (roll_number, pw_hash, full_name))
        user_id = cursor.lastrowid
        
        cursor.execute("""
            INSERT INTO students (roll_number, user_id, full_name, program_id, department, semester, email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (roll_number, user_id, full_name, program_id, department, semester, email))
        
        subjects = cursor.execute("SELECT code, coordinator_id FROM subjects WHERE program_id = ?", (program_id,)).fetchall()
        for subj in subjects:
            cursor.execute("""
                INSERT INTO marks (student_roll, subject_code, session, semester, pre_mid_marks, post_mid_marks, total_marks, grade, updated_by)
                VALUES (?, ?, '2025-2026', ?, 0, 0, 0, 'F', ?)
            """, (roll_number, subj['code'], semester, subj['coordinator_id']))
            
        conn.commit()
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        raise ValueError(f"Roll number or username '{roll_number}' already exists.")
    except Exception as e:
        conn.close()
        raise e

def delete_student(roll_number):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        student = cursor.execute("SELECT user_id FROM students WHERE roll_number = ?", (roll_number,)).fetchone()
        if not student:
            conn.close()
            raise ValueError(f"Student with roll number {roll_number} does not exist.")
            
        user_id = student['user_id']
        cursor.execute("DELETE FROM marks WHERE student_roll = ?", (roll_number,))
        cursor.execute("DELETE FROM students WHERE roll_number = ?", (roll_number,))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        conn.close()
        raise e

if __name__ == "__main__":
    initialize_database()
