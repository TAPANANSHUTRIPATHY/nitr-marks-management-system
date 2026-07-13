# Centralized Academic Tracking & Evaluation System (AcadTrack) for NIT Rourkela

AcadTrack is a secure, role-based, full-stack academic grading and management system customized for **NIT Rourkela**. The application allows administrators and academic coordinators to organize academic terms, manage student records, input evaluation metrics (Pre and Post Mid-Semester), and perform automated grade calculations. It also permits students to securely sign in and access their printable academic reports.

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Head of the Department**: Complete management control over students, coordinators, course subjects, academic sessions, and high-level analytical dashboards.
   - **Sub Coordinators (Department Level)**: Assigned to specific programs (B.Tech, M.Tech, PhD). Can register new students in their program, access student lists, and edit grading marks for their coordinated subjects.
   - **Students (Read-only)**: Restricted access to review only their individual semester courses, marks, and grades.

2. **Automated Grade & Mark Computations**:
   - Accepts **Pre Mid-Semester** (Max 50) and **Post Mid-Semester** (Max 50) marks.
   - Live grading and cumulative totals calculation on the client interface and secure validation on the server side.
   - NIT Rourkela grading scale mapping:
     - Total $\ge 90 \rightarrow \mathbf{Ex}$ (Excellent)
     - $80 - 89 \rightarrow \mathbf{A}$
     - $70 - 79 \rightarrow \mathbf{B}$
     - $60 - 69 \rightarrow \mathbf{C}$
     - $50 - 59 \rightarrow \mathbf{D}$
     - $40 - 49 \rightarrow \mathbf{P}$ (Pass)
     - $< 40 \rightarrow \mathbf{F}$ (Fail)

3. **Data Portability & Reports**:
   - **CSV Export**: Instantly export academic performance tables.
   - **Transcript Report Print**: CSS print-media optimized layout to print beautiful, official-looking student marks cards directly from the browser.

4. **Branded Visual Experience**:
   - Branded with NIT Rourkela's corporate colors: Deep Space Blue, Sleek Gold, and Slate Grey.
   - Includes glassmorphism widgets, custom analytical charts (Program Averages & Grade Distributions), and supports dynamic Dark Mode / Light Mode.

---

## 🛠️ Tech Stack & Design Choices

- **Backend**: Python 3.13 + **Flask 3.1.3**
- **Security**: Custom HS256 **JWT Secure Session Token** implementation via Python standard library HMAC-SHA256 (requires no external library overhead). Password hashing using **PBKDF2-SHA256** with random salt.
- **Database**: **SQLite** (relational, embedded, file-based, requiring zero database daemon installs).
- **Frontend**: Clean HTML5 layout, custom Responsive Flexbox/Grid CSS, and vanilla ES6 Javascript SPA engine (no build steps, instantly runnable, premium design).

---

## 📦 Folder Structure

```
├── app.py              # Main Flask server & API routes
├── database.py         # SQLite connection, schema, and seeding script
├── acadtrack.db        # Generated SQLite database (created on startup)
├── static/
│   ├── index.html      # Main Single Page Application structure
│   ├── css/
│   │   └── styles.css  # Custom CSS stylesheet (variables, themes, print rules)
│   └── js/
│       └── app.js      # Frontend state manager, routers, and charts engine
└── README.md           # Instructions, schema details, and credentials
```

---

## 🔧 Installation and Launch

### 1. Requirements
Ensure Python 3 is installed. The backend uses `Flask`, which is already installed on the workspace environment. If you need to re-install packages, run:
```bash
pip install flask
```

### 2. Initialize Database and Start Server
When you run the server for the first time, it will automatically call `database.py` to create `acadtrack.db` and seed the **60 student records** and administrative accounts.

Run the application:
```bash
python app.py
```

### 3. Open Browser
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 🔑 Sample Portal Credentials

Use the following accounts to test the RBAC capabilities of the application:

### 👑 1. Head of the Department (Full Control)
- **Username**: `sdhawan` (or `admin`)
- **Password**: `admin123`
- *Real Name*: Prof. Satish Dhawan

### 👔 2. Department Coordinators (Program Control)
- **B.Tech (CSE)**:
  - **Username**: `ramesh`
  - **Password**: `coord123`
  - *Real Name*: Dr. Ramesh Kumar
- **B.Tech (ECE)**:
  - **Username**: `sunita`
  - **Password**: `coord123`
  - *Real Name*: Dr. Sunita Sharma
- **M.Tech (Mech)**:
  - **Username**: `amit`
  - **Password**: `coord123`
  - *Real Name*: Dr. Amit Patel
- **PhD (Biotech)**:
  - **Username**: `rajesh`
  - **Password**: `coord123`
  - *Real Name*: Dr. Rajesh Sen

### 🎓 3. Students (Read-only Reports)
The database is seeded with **60 unique students** (20 in B.Tech, 20 in M.Tech, 20 in PhD).
- **Default password for all students**: `student123`
- **Roll Number Examples (Usernames)**:
  - **B.Tech CSE**: `125CS0001` through `125CS0020` (e.g., login with `125CS0001` and password `student123`)
  - **M.Tech ME**: `225ME0001` through `225ME0020`
  - **PhD BT**: `325BT0001` through `325BT0020`
