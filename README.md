# Centralized Marks Management System (MMS) - NIT Rourkela

A robust, secure, role-based centralized Marks Management System designed for National Institute of Technology, Rourkela (NIT Rourkela). The system simplifies the management of students, subjects, academic sessions, marks entry, grading schemes, and report generation for administrators, coordinators, and faculty.

---

## 🌟 Key Features

### 1. Administrative Management
- **Academic Sessions**: Set up and manage academic sessions (e.g., Autumn 2024, Spring 2025).
- **Semester Structure**: Organize semesters and dynamically map subjects to semesters.
- **Subject Registry**: Register subjects with characteristics like type (Theory, Practical) and credits.
- **Student Enrollment**: Efficiently manage and query student cohorts, mapping them to academic sessions.

### 2. Role-Based Access Control (RBAC) & Security
- **Global Roles**:
  - `ADMIN`: Full administrative access to system configurations, session data, user mapping, and audit logs.
  - `FACULTY`: Restructured access based on subject allocation.
- **Subject Assignment Roles**:
  - `COORDINATOR`: Full controller of a subject, sets the grading boundaries, submits, and locks marks for all sections.
  - `SUB_COORDINATOR`: Restricted to entering and saving marks only for their assigned section.
- **Token-based Security**: Stateless JWT-based session management and Spring Security filters.

### 3. Marks & Grading Lifecycle
- **Unified Marks Entry**: Record details for Pre Mid-Sem, Mid-Sem, Post Mid-Sem, and Practical evaluations.
- **Batch Processing**: Spreadsheet-like interface to save marks in bulk.
- **Submission & Locking**: Multi-step marks approval. Sub-coordinators save drafts, coordinators submit, and locks are applied to final records to ensure auditability.
- **Grading Schemes**: Define custom grading systems (e.g., Absolute/Relative) and set grade boundaries.
- **Automated SGPA Calculation**: Automated grade mapping and calculation of SGPA.

### 4. Auditing & Logging
- **Audit Trails**: Capture every action (marks updates, submissions, locks, grading changes) with details like user, IP, action, entity class, and timestamp to ensure data integrity and security.

### 5. Reporting & Analytics
- **Visual Analytics**: Interactive dashboards highlighting grade distributions and class statistics.
- **Semester Reports**: Performance reports and gradesheets for student cohorts.

---

## 🛠️ Technology Stack

### Backend
- **Core Framework**: Spring Boot 3.2.5
- **Security**: Spring Security (stateless authentication via JWT)
- **Database**: PostgreSQL (JPA/Hibernate ORM with auto-updating schema)
- **API Documentation**: OpenAPI / Swagger (via Springdoc-openapi)
- **Build Tool**: Maven
- **Environment**: Java 17

### Frontend
- **Core Library**: React 19 (built on Vite)
- **Routing**: React Router DOM v7 (with lazy loading)
- **HTTP Client**: Axios (with custom interceptors for JWT injection)
- **Iconography**: Lucide React
- **Styling**: Vanilla CSS (CSS variables, responsive layouts, support for Light/Dark mode)
- **Testing**: Vitest + Testing Library

---

## 📂 Project Structure

```text
marks-management-system/
├── marks-management-backend/                  # Spring Boot REST API
│   ├── src/main/java/com/nitrourkela/marks/
│   │   ├── config/                            # Security configs & data seeders
│   │   ├── controller/                        # REST Controllers
│   │   ├── exception/                         # Custom exceptions & global exception handlers
│   │   ├── model/                             # Entities, DTOs, and Enums
│   │   │   ├── dto/                           # Data Transfer Objects
│   │   │   ├── entity/                        # JPA Entities (Student, Marks, Session, AuditLog, etc.)
│   │   │   └── enums/                         # Enum definitions (GlobalRole, MarksStatus, etc.)
│   │   ├── repository/                        # JPA Repository interfaces
│   │   ├── security/                          # JWT filters, UserPrincipal, & RBAC service
│   │   └── service/                           # Business logic implementations
│   ├── src/main/resources/
│   │   └── application.yml                    # Database & JWT settings
│   └── pom.xml                                # Backend Maven dependencies
│
└── marks-management-frontend/                 # Vite + React Single Page Application
    ├── src/
    │   ├── api/                               # Axios HTTP clients (Auth, Faculty, Marks, etc.)
    │   ├── components/
    │   │   └── layout/                        # Core UI Shell (Sidebar, Header, AppLayout)
    │   ├── context/                           # React Context (AuthContext, ThemeContext)
    │   ├── pages/                             # Route-level Page Components
    │   │   ├── admin/                         # Session, Student, Semester, Subject & Grade Management
    │   │   ├── audit/                         # Audit trail logs viewer
    │   │   ├── marks/                         # Section-level Marks Entry dashboard
    │   │   ├── reports/                       # Student Semester Grade Sheets & distribution charts
    │   │   ├── Dashboard.jsx                  # Main home component (role-based)
    │   │   └── Login.jsx                      # Form with Authentication validation
    │   ├── styles/                            # Global CSS variables & styling configs
    │   ├── utils/                             # Helper/utility functions
    │   ├── App.jsx                            # Route mappings and providers
    │   └── main.jsx                           # Application entry point
    ├── index.html                             # Single Page Application template HTML
    ├── package.json                           # Frontend dependencies & scripts
    └── vite.config.js                         # Vite configurations
```

---

## 🚀 Getting Started

### Backend Setup
1. **Prerequisites**: Ensure you have Java 17 and PostgreSQL installed.
2. **Database Configuration**:
   - Create a database named `marks_db`.
   - Update database credentials in [application.yml](file:///c:/Users/shadi/.gemini/antigravity/scratch/marks-management-system/marks-management-backend/src/main/resources/application.yml) or set corresponding environment variables (`DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`).
3. **Run Backend**:
   Navigate to the backend directory and run:
   ```bash
   mvn spring-boot:run
   ```
   The backend API will run on `http://localhost:8080`.

### Frontend Setup
1. **Prerequisites**: Node.js installed.
2. **Install Dependencies**:
   Navigate to the frontend directory and run:
   ```bash
   npm install
   ```
3. **Run Frontend**:
   ```bash
   npm run dev
   ```
   The frontend will be active at `http://localhost:5173`.

---

## 🧪 Testing

### Backend
Run unit tests with Maven:
```bash
mvn test
```

### Frontend
Run unit tests with Vitest:
```bash
npm run test
```
