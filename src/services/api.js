// Simulated backend API layer for NIT Rourkela Marks Management System
// Synced with LocalStorage. Implements mock async RESTful APIs with network latency simulation.
// Fulfills the B.Tech project requirement by including structured seed data:
// 1 Admin, 3 Course Coordinators, 10 Sub-Coordinators, and 20 Students.

// Helper to delay executions (simulating API latency)
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for Grade calculation based on total marks
export const calculateGrade = (total) => {
  if (total >= 90) return 'Ex'; // Excellent
  if (total >= 80) return 'A';  // Very Good
  if (total >= 70) return 'B';  // Good
  if (total >= 60) return 'C';  // Fair
  if (total >= 50) return 'D';  // Average
  if (total >= 35) return 'P';  // Pass
  return 'F';                   // Fail
};

// Initial Seed Data
const INITIAL_SESSIONS = [
  { id: 'sess-1', name: 'Autumn Semester 2025-26', isActive: false },
  { id: 'sess-2', name: 'Spring Semester 2025-26', isActive: true }
];

const INITIAL_SEMESTERS = [
  { id: 'sem-1', name: '1st Semester', sessionId: 'sess-1' },
  { id: 'sem-3', name: '3rd Semester', sessionId: 'sess-1' },
  { id: 'sem-5', name: '5th Semester', sessionId: 'sess-2' },
  { id: 'sem-7', name: '7th Semester', sessionId: 'sess-2' }
];

const INITIAL_FACULTY = [
  // 1 Admin
  { id: 'fac-admin', name: 'Prof. Debajyoti Choudhury', email: 'admin@nitrkl.ac.in', password: 'admin123', role: 'Admin', department: 'Computer Science & Engineering' },
  
  // 3 Course Coordinators
  { id: 'fac-cc1', name: 'Dr. Ramesh Chandra', email: 'cc1@nitrkl.ac.in', password: 'cc123', role: 'Course Coordinator', department: 'Computer Science & Engineering' },
  { id: 'fac-cc2', name: 'Dr. Saroj Kumar', email: 'cc2@nitrkl.ac.in', password: 'cc123', role: 'Course Coordinator', department: 'Electronics & Communication Eng.' },
  { id: 'fac-cc3', name: 'Dr. Mamata Singh', email: 'cc3@nitrkl.ac.in', password: 'cc123', role: 'Course Coordinator', department: 'Mechanical Engineering' },

  // 10 Sub-Coordinators
  { id: 'fac-sc1', name: 'Dr. Amit Verma', email: 'sc1@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Computer Science & Engineering' },
  { id: 'fac-sc2', name: 'Dr. Priya Patel', email: 'sc2@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Computer Science & Engineering' },
  { id: 'fac-sc3', name: 'Dr. Rajesh Nayak', email: 'sc3@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Computer Science & Engineering' },
  { id: 'fac-sc4', name: 'Dr. Sunita Rao', email: 'sc4@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Electronics & Communication Eng.' },
  { id: 'fac-sc5', name: 'Dr. Vikas Sen', email: 'sc5@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Electronics & Communication Eng.' },
  { id: 'fac-sc6', name: 'Dr. Ananya Das', email: 'sc6@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Mechanical Engineering' },
  { id: 'fac-sc7', name: 'Dr. Manoj Kumar', email: 'sc7@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Mechanical Engineering' },
  { id: 'fac-sc8', name: 'Dr. Sandeep Sahu', email: 'sc8@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Electrical Engineering' },
  { id: 'fac-sc9', name: 'Dr. Neha Sharma', email: 'sc9@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Electrical Engineering' },
  { id: 'fac-sc10', name: 'Dr. Pradeep Jena', email: 'sc10@nitrkl.ac.in', password: 'sub123', role: 'Sub-Coordinator', department: 'Metallurgical & Materials Eng.' }
];

const INITIAL_SUBJECTS = [
  { id: 'subj-1', code: 'CS-301', name: 'Database Management Systems', credits: 4, semesterId: 'sem-5', coordinatorId: 'fac-cc1', subCoordinators: ['fac-sc1', 'fac-sc2'] },
  { id: 'subj-2', code: 'CS-303', name: 'Design and Analysis of Algorithms', credits: 4, semesterId: 'sem-5', coordinatorId: 'fac-cc1', subCoordinators: ['fac-sc3'] },
  { id: 'subj-3', code: 'EC-301', name: 'Digital Communication', credits: 3, semesterId: 'sem-5', coordinatorId: 'fac-cc2', subCoordinators: ['fac-sc4', 'fac-sc5'] },
  { id: 'subj-4', code: 'ME-301', name: 'Heat Transfer', credits: 4, semesterId: 'sem-5', coordinatorId: 'fac-cc3', subCoordinators: ['fac-sc6', 'fac-sc7'] },
  { id: 'subj-5', code: 'EE-301', name: 'Power Electronics', credits: 4, semesterId: 'sem-5', coordinatorId: 'fac-cc2', subCoordinators: ['fac-sc8', 'fac-sc9'] }
];

const INITIAL_STUDENTS = [
  // 20 Students (CSE: 5, ECE: 5, ME: 5, EE: 5)
  { rollNumber: '122CS0101', name: 'Aarav Sharma', email: '122cs0101@nitrkl.ac.in', branch: 'CSE', semesterId: 'sem-5', section: 'A' },
  { rollNumber: '122CS0102', name: 'Aditya Verma', email: '122cs0102@nitrkl.ac.in', branch: 'CSE', semesterId: 'sem-5', section: 'A' },
  { rollNumber: '122CS0103', name: 'Ananya Mishra', email: '122cs0103@nitrkl.ac.in', branch: 'CSE', semesterId: 'sem-5', section: 'B' },
  { rollNumber: '122CS0104', name: 'Ayush Sen', email: '122cs0104@nitrkl.ac.in', branch: 'CSE', semesterId: 'sem-5', section: 'B' },
  { rollNumber: '122CS0105', name: 'Devendra Sahu', email: '122cs0105@nitrkl.ac.in', branch: 'CSE', semesterId: 'sem-5', section: 'A' },

  { rollNumber: '122EC0201', name: 'Isha Patel', email: '122ec0201@nitrkl.ac.in', branch: 'ECE', semesterId: 'sem-5', section: 'A' },
  { rollNumber: '122EC0202', name: 'Karan Singh', email: '122ec0202@nitrkl.ac.in', branch: 'ECE', semesterId: 'sem-5', section: 'A' },
  { rollNumber: '122EC0203', name: 'Meera Das', email: '122ec0203@nitrkl.ac.in', branch: 'ECE', semesterId: 'sem-5', section: 'B' },
  { rollNumber: '122EC0204', name: 'Nikhil Rao', email: '122ec0204@nitrkl.ac.in', branch: 'ECE', semesterId: 'sem-5', section: 'B' },
  { rollNumber: '122EC0205', name: 'Pooja Roy', email: '122ec0205@nitrkl.ac.in', branch: 'ECE', semesterId: 'sem-5', section: 'A' },

  { rollNumber: '122ME0301', name: 'Rahul Mohanty', email: '122me0301@nitrkl.ac.in', branch: 'ME', semesterId: 'sem-5', section: 'A' },
  { rollNumber: '122ME0302', name: 'Riya Behera', email: '122me0302@nitrkl.ac.in', branch: 'ME', semesterId: 'sem-5', section: 'A' },
  { rollNumber: '122ME0303', name: 'Siddharth Dash', email: '122me0303@nitrkl.ac.in', branch: 'ME', semesterId: 'sem-5', section: 'B' },
  { rollNumber: '122ME0304', name: 'Sneha Samal', email: '122me0304@nitrkl.ac.in', branch: 'ME', semesterId: 'sem-5', section: 'B' },
  { rollNumber: '122ME0305', name: 'Tushar Tripathy', email: '122me0305@nitrkl.ac.in', branch: 'ME', semesterId: 'sem-5', section: 'A' },

  { rollNumber: '122EE0401', name: 'Abhishek Rout', email: '122ee0401@nitrkl.ac.in', branch: 'EE', semesterId: 'sem-5', section: 'A' },
  { rollNumber: '122EE0402', name: 'Deepika Sethy', email: '122ee0402@nitrkl.ac.in', branch: 'EE', semesterId: 'sem-5', section: 'A' },
  { rollNumber: '122EE0403', name: 'Manas Pradhan', email: '122ee0403@nitrkl.ac.in', branch: 'EE', semesterId: 'sem-5', section: 'B' },
  { rollNumber: '122EE0404', name: 'Pragya Swain', email: '122ee0404@nitrkl.ac.in', branch: 'EE', semesterId: 'sem-5', section: 'B' },
  { rollNumber: '122EE0405', name: 'Vikram Nayak', email: '122ee0405@nitrkl.ac.in', branch: 'EE', semesterId: 'sem-5', section: 'A' }
];

// Pre-seeded marks for demo
// Subject 1 (CS-301) for CSE students
// Subject 2 (CS-303) for CSE students
// Subject 3 (EC-301) for ECE students
// Subject 4 (ME-301) for ME students
// Subject 5 (EE-301) for EE students
const INITIAL_MARKS = [
  // CS-301 Marks (DBMS)
  { id: 'm-1', studentRoll: '122CS0101', subjectCode: 'CS-301', preMid: 24, postMid: 62, total: 86, grade: 'A' },
  { id: 'm-2', studentRoll: '122CS0102', subjectCode: 'CS-301', preMid: 28, postMid: 65, total: 93, grade: 'Ex' },
  { id: 'm-3', studentRoll: '122CS0103', subjectCode: 'CS-301', preMid: 20, postMid: 55, total: 75, grade: 'B' },
  { id: 'm-4', studentRoll: '122CS0104', subjectCode: 'CS-301', preMid: 18, postMid: 48, total: 66, grade: 'C' },
  { id: 'm-5', studentRoll: '122CS0105', subjectCode: 'CS-301', preMid: 22, postMid: 58, total: 80, grade: 'A' },

  // CS-303 Marks (DAA)
  { id: 'm-6', studentRoll: '122CS0101', subjectCode: 'CS-303', preMid: 25, postMid: 58, total: 83, grade: 'A' },
  { id: 'm-7', studentRoll: '122CS0102', subjectCode: 'CS-303', preMid: 29, postMid: 62, total: 91, grade: 'Ex' },
  { id: 'm-8', studentRoll: '122CS0103', subjectCode: 'CS-303', preMid: 19, postMid: 50, total: 69, grade: 'C' },
  { id: 'm-9', studentRoll: '122CS0104', subjectCode: 'CS-303', preMid: 21, postMid: 54, total: 75, grade: 'B' },
  { id: 'm-10', studentRoll: '122CS0105', subjectCode: 'CS-303', preMid: 23, postMid: 60, total: 83, grade: 'A' },

  // EC-301 Marks (Digital Comm)
  { id: 'm-11', studentRoll: '122EC0201', subjectCode: 'EC-301', preMid: 21, postMid: 52, total: 73, grade: 'B' },
  { id: 'm-12', studentRoll: '122EC0202', subjectCode: 'EC-301', preMid: 27, postMid: 60, total: 87, grade: 'A' },
  { id: 'm-13', studentRoll: '122EC0203', subjectCode: 'EC-301', preMid: 15, postMid: 45, total: 60, grade: 'C' },
  { id: 'm-14', studentRoll: '122EC0204', subjectCode: 'EC-301', preMid: 22, postMid: 53, total: 75, grade: 'B' },
  { id: 'm-15', studentRoll: '122EC0205', subjectCode: 'EC-301', preMid: 25, postMid: 65, total: 90, grade: 'Ex' },

  // ME-301 Marks (Heat Transfer)
  { id: 'm-16', studentRoll: '122ME0301', subjectCode: 'ME-301', preMid: 23, postMid: 55, total: 78, grade: 'B' },
  { id: 'm-17', studentRoll: '122ME0302', subjectCode: 'ME-301', preMid: 26, postMid: 58, total: 84, grade: 'A' },
  { id: 'm-18', studentRoll: '122ME0303', subjectCode: 'ME-301', preMid: 19, postMid: 48, total: 67, grade: 'C' },
  { id: 'm-19', studentRoll: '122ME0304', subjectCode: 'ME-301', preMid: 22, postMid: 50, total: 72, grade: 'B' },
  { id: 'm-20', studentRoll: '122ME0305', subjectCode: 'ME-301', preMid: 24, postMid: 61, total: 85, grade: 'A' },

  // EE-301 Marks (Power Electronics)
  { id: 'm-21', studentRoll: '122EE0401', subjectCode: 'EE-301', preMid: 20, postMid: 50, total: 70, grade: 'B' },
  { id: 'm-22', studentRoll: '122EE0402', subjectCode: 'EE-301', preMid: 28, postMid: 64, total: 92, grade: 'Ex' },
  { id: 'm-23', studentRoll: '122EE0403', subjectCode: 'EE-301', preMid: 17, postMid: 42, total: 59, grade: 'D' },
  { id: 'm-24', studentRoll: '122EE0404', subjectCode: 'EE-301', preMid: 21, postMid: 49, total: 70, grade: 'B' },
  { id: 'm-25', studentRoll: '122EE0405', subjectCode: 'EE-301', preMid: 23, postMid: 55, total: 78, grade: 'B' }
];

const INITIAL_ACTIVITIES = [
  { id: 'act-1', text: 'Admin initialized the system config.', time: '2 hours ago', user: 'Prof. Debajyoti Choudhury' },
  { id: 'act-2', text: 'Active academic session set to Spring Semester 2025-26.', time: '1 hour ago', user: 'Prof. Debajyoti Choudhury' },
  { id: 'act-3', text: 'Dr. Ramesh Chandra updated pre-midsem marks for CS-301.', time: '30 mins ago', user: 'Dr. Ramesh Chandra' }
];

// Helper to fetch data or initialize with defaults
const getStorageItem = (key, initial) => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(item);
};

const setStorageItem = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  // Authentication API
  login: async (email, password) => {
    await delay(300);
    const faculty = getStorageItem('nitr_marks_faculty', INITIAL_FACULTY);
    const user = faculty.find(f => f.email.toLowerCase() === email.toLowerCase() && f.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    // Return sanitized profile (omit password)
    const { password: _, ...profile } = user;
    return profile;
  },

  // Sessions CRUD
  getSessions: async () => {
    await delay(150);
    return getStorageItem('nitr_marks_sessions', INITIAL_SESSIONS);
  },
  saveSession: async (session) => {
    await delay(200);
    const sessions = getStorageItem('nitr_marks_sessions', INITIAL_SESSIONS);
    if (session.id) {
      // Edit
      const index = sessions.findIndex(s => s.id === session.id);
      if (index !== -1) sessions[index] = session;
    } else {
      // Create
      session.id = `sess-${Date.now()}`;
      sessions.push(session);
    }
    setStorageItem('nitr_marks_sessions', sessions);
    api.addActivity(`Session '${session.name}' created/updated.`, 'Admin');
    return session;
  },
  deleteSession: async (id) => {
    await delay(200);
    let sessions = getStorageItem('nitr_marks_sessions', INITIAL_SESSIONS);
    const session = sessions.find(s => s.id === id);
    if (session?.isActive) {
      throw new Error('Cannot delete the active academic session.');
    }
    sessions = sessions.filter(s => s.id !== id);
    setStorageItem('nitr_marks_sessions', sessions);
    api.addActivity(`Session deleted.`, 'Admin');
    return true;
  },
  setActiveSession: async (id) => {
    await delay(200);
    const sessions = getStorageItem('nitr_marks_sessions', INITIAL_SESSIONS);
    const updated = sessions.map(s => ({
      ...s,
      isActive: s.id === id
    }));
    setStorageItem('nitr_marks_sessions', updated);
    const active = updated.find(s => s.isActive);
    api.addActivity(`Session '${active?.name}' set as active.`, 'Admin');
    return updated;
  },

  // Semesters CRUD
  getSemesters: async () => {
    await delay(150);
    return getStorageItem('nitr_marks_semesters', INITIAL_SEMESTERS);
  },
  saveSemester: async (semester) => {
    await delay(200);
    const semesters = getStorageItem('nitr_marks_semesters', INITIAL_SEMESTERS);
    if (semester.id) {
      const index = semesters.findIndex(s => s.id === semester.id);
      if (index !== -1) semesters[index] = semester;
    } else {
      semester.id = `sem-${Date.now()}`;
      semesters.push(semester);
    }
    setStorageItem('nitr_marks_semesters', semesters);
    return semester;
  },
  deleteSemester: async (id) => {
    await delay(200);
    const semesters = getStorageItem('nitr_marks_semesters', INITIAL_SEMESTERS);
    const filtered = semesters.filter(s => s.id !== id);
    setStorageItem('nitr_marks_semesters', filtered);
    return true;
  },

  // Subjects CRUD
  getSubjects: async () => {
    await delay(150);
    return getStorageItem('nitr_marks_subjects', INITIAL_SUBJECTS);
  },
  saveSubject: async (subject) => {
    await delay(200);
    const subjects = getStorageItem('nitr_marks_subjects', INITIAL_SUBJECTS);
    if (subject.id) {
      const index = subjects.findIndex(s => s.id === subject.id);
      if (index !== -1) subjects[index] = subject;
    } else {
      subject.id = `subj-${Date.now()}`;
      subject.subCoordinators = subject.subCoordinators || [];
      subjects.push(subject);
    }
    setStorageItem('nitr_marks_subjects', subjects);
    return subject;
  },
  deleteSubject: async (id) => {
    await delay(200);
    const subjects = getStorageItem('nitr_marks_subjects', INITIAL_SUBJECTS);
    const filtered = subjects.filter(s => s.id !== id);
    setStorageItem('nitr_marks_subjects', filtered);
    return true;
  },

  // Faculty CRUD & Assignments
  getFaculty: async () => {
    await delay(150);
    return getStorageItem('nitr_marks_faculty', INITIAL_FACULTY);
  },
  saveFaculty: async (member) => {
    await delay(200);
    const faculty = getStorageItem('nitr_marks_faculty', INITIAL_FACULTY);
    if (member.id) {
      const index = faculty.findIndex(f => f.id === member.id);
      if (index !== -1) {
        // Keep password if not changed
        member.password = member.password || faculty[index].password;
        faculty[index] = member;
      }
    } else {
      member.id = `fac-${Date.now()}`;
      member.password = member.password || 'welcome123'; // default password
      faculty.push(member);
    }
    setStorageItem('nitr_marks_faculty', faculty);
    return member;
  },
  deleteFaculty: async (id) => {
    await delay(200);
    const faculty = getStorageItem('nitr_marks_faculty', INITIAL_FACULTY);
    const filtered = faculty.filter(f => f.id !== id);
    setStorageItem('nitr_marks_faculty', filtered);
    return true;
  },

  // Students CRUD
  getStudents: async () => {
    await delay(150);
    return getStorageItem('nitr_marks_students', INITIAL_STUDENTS);
  },
  saveStudent: async (student) => {
    await delay(200);
    const students = getStorageItem('nitr_marks_students', INITIAL_STUDENTS);
    const index = students.findIndex(s => s.rollNumber === student.rollNumber);
    if (index !== -1) {
      // Update
      students[index] = student;
    } else {
      // Validate unique roll number
      const exists = students.some(s => s.rollNumber.toLowerCase() === student.rollNumber.toLowerCase());
      if (exists) throw new Error('Roll Number already exists.');
      students.push(student);
    }
    setStorageItem('nitr_marks_students', students);
    return student;
  },
  deleteStudent: async (rollNumber) => {
    await delay(200);
    const students = getStorageItem('nitr_marks_students', INITIAL_STUDENTS);
    const filtered = students.filter(s => s.rollNumber !== rollNumber);
    setStorageItem('nitr_marks_students', filtered);
    return true;
  },

  // Marks Entry and Management
  getAllMarks: async () => {
    await delay(150);
    return getStorageItem('nitr_marks_marks', INITIAL_MARKS);
  },
  saveMarks: async (subjectCode, updatedMarks, facultyName) => {
    await delay(300);
    const marks = getStorageItem('nitr_marks_marks', INITIAL_MARKS);
    
    // Process each student's updated marks
    updatedMarks.forEach(um => {
      const existingIndex = marks.findIndex(m => m.studentRoll === um.studentRoll && m.subjectCode === subjectCode);
      const preMid = Number(um.preMid) || 0;
      const postMid = Number(um.postMid) || 0;
      const total = preMid + postMid;
      const grade = calculateGrade(total);

      const record = {
        studentRoll: um.studentRoll,
        subjectCode: subjectCode,
        preMid,
        postMid,
        total,
        grade
      };

      if (existingIndex !== -1) {
        record.id = marks[existingIndex].id;
        marks[existingIndex] = record;
      } else {
        record.id = `m-${Date.now()}-${um.studentRoll}`;
        marks.push(record);
      }
    });

    setStorageItem('nitr_marks_marks', marks);
    api.addActivity(`Marks updated for subject ${subjectCode}.`, facultyName);
    return true;
  },

  // Profile operations
  updateProfile: async (facultyId, name, email, department) => {
    await delay(200);
    const faculty = getStorageItem('nitr_marks_faculty', INITIAL_FACULTY);
    const index = faculty.findIndex(f => f.id === facultyId);
    if (index === -1) throw new Error('Faculty member not found');
    
    faculty[index].name = name;
    faculty[index].email = email;
    faculty[index].department = department;

    setStorageItem('nitr_marks_faculty', faculty);
    return faculty[index];
  },
  changePassword: async (facultyId, currentPassword, newPassword) => {
    await delay(200);
    const faculty = getStorageItem('nitr_marks_faculty', INITIAL_FACULTY);
    const index = faculty.findIndex(f => f.id === facultyId);
    if (index === -1) throw new Error('Faculty member not found');
    if (faculty[index].password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    
    faculty[index].password = newPassword;
    setStorageItem('nitr_marks_faculty', faculty);
    return true;
  },

  // Activities log
  getActivities: async () => {
    await delay(100);
    return getStorageItem('nitr_marks_activities', INITIAL_ACTIVITIES);
  },
  addActivity: (text, userName) => {
    const activities = getStorageItem('nitr_marks_activities', INITIAL_ACTIVITIES);
    const newAct = {
      id: `act-${Date.now()}`,
      text,
      time: 'Just now',
      user: userName
    };
    activities.unshift(newAct);
    // limit logs to 30
    if (activities.length > 30) activities.pop();
    setStorageItem('nitr_marks_activities', activities);
  }
};
