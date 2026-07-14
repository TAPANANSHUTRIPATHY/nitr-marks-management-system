# NITR Marks Management System

A centralized, role‑based marks management system for NIT Rourkela. It streamlines handling of students, subjects, academic sessions, and both Pre‑Mid‑Semester and Post‑Mid‑Semester assessment records.

---

## ✨ Features
- **Role‑Based Access**: Admin, faculty, and student views.
- **Student & Subject Management**: CRUD operations with validation.
- **Session Handling**: Academic year and semester organization.
- **Assessment Records**: Record, edit, and view pre‑mid and post‑mid marks.
- **Export / Import**: CSV export for reports and bulk data import.
- **Responsive UI**: Clean interface built with modern web technologies.

---

## 🛠️ Tech Stack
- **Backend**: Node.js with Express (or Django/Flask – adapt as needed)
- **Database**: PostgreSQL (or MySQL) for relational data integrity
- **Frontend**: HTML5, CSS3 (with a premium design), JavaScript (ES6+)
- **Version Control**: Git

---

## 📦 Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nitr-marks-management-system.git
   cd nitr-marks-management-system
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure the database**
   - Create a PostgreSQL database.
   - Update the connection string in `config/.env`.
4. **Run migrations** (if applicable)
   ```bash
   npm run migrate
   ```
5. **Start the application**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.

---

## 🚀 Usage
- **Admin**: Access the dashboard to manage users, subjects, and sessions.
- **Faculty**: Enter and edit assessment records for assigned classes.
- **Student**: View personal marks and academic progress.

---








