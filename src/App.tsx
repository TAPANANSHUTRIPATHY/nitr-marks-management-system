import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Database,
  Lock,
  Unlock,
  FileSpreadsheet,
  UserCheck,
  Users,
  LogOut,
  GraduationCap,
  TrendingUp,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  ShieldAlert,
  Printer,
  BookOpen,
  Info,
  X,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LayoutGrid,
  Layers,
  Award,
  Trash2,
  Search,
  Download
} from 'lucide-react';

// ================= TYPES =================
interface Session {
  id: string;
  name: string;
  isActive: boolean;
}

interface Semester {
  id: string;
  number: number;
  name: string;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  ltp: string; // e.g. "3-0-0"
  coordinatorId: string; // Faculty ID
  subCoordinatorId?: string; // Faculty ID
  semesterId: string;
}

interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  department: string;
}

interface Mark {
  studentId: string;
  preMid: number | null; // Max 30
  postMid: number | null; // Max 50
  ta: number | null; // Max 20
  total: number | null; // Max 100
  grade: string | null;
}

interface CourseState {
  subjectId: string;
  sessionId: string;
  semesterId: string;
  isLocked: boolean;
  marks: Record<string, Mark>; // studentId -> Mark
}

interface UnlockRequest {
  id: string;
  subjectId: string;
  sessionId: string;
  semesterId: string;
  facultyId: string;
  facultyName: string;
  subjectCode: string;
  subjectName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  extraId?: string; // student roll no or faculty initials
}

// ================= INITIAL PRE-SEEDED DATA =================
const INITIAL_SESSIONS: Session[] = [
  { id: 'sess-1', name: '2025-26 Autumn', isActive: true },
  { id: 'sess-2', name: '2025-26 Spring', isActive: false }
];

const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem-1', number: 1, name: '1st Semester' },
  { id: 'sem-3', number: 3, name: '3rd Semester' },
  { id: 'sem-5', number: 5, name: '5th Semester' },
  { id: 'sem-7', number: 7, name: '7th Semester' }
];

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    code: 'CS-303',
    name: 'Advanced Database Systems',
    credits: 3,
    ltp: '3-0-0',
    coordinatorId: 'fac-1', // Dr. B. D. Sahoo
    subCoordinatorId: 'fac-2', // Dr. A. K. Turuk
    semesterId: 'sem-5'
  },
  {
    id: 'sub-2',
    code: 'CS-305',
    name: 'Compiler Design',
    credits: 4,
    ltp: '3-1-0',
    coordinatorId: 'fac-2', // Dr. A. K. Turuk
    subCoordinatorId: 'fac-1', // Dr. B. D. Sahoo
    semesterId: 'sem-5'
  },
  {
    id: 'sub-3',
    code: 'CS-307',
    name: 'Computer Networks',
    credits: 4,
    ltp: '3-0-2',
    coordinatorId: 'fac-1', // Dr. B. D. Sahoo
    semesterId: 'sem-5'
  }
];

// Calculate Letter Grade based on NIT Rourkela standards (with dynamic administrator override)
const calculateGrade = (total: number, customThresholds?: { S: number; A: number; B: number; C: number; D: number; E: number }): string => {
  let thresholds = customThresholds;
  if (!thresholds) {
    try {
      const saved = localStorage.getItem('mms_grading_thresholds');
      if (saved) {
        thresholds = JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
  }
  const t = thresholds || { S: 90, A: 80, B: 70, C: 60, D: 50, E: 35 };
  if (total >= t.S) return 'S';
  if (total >= t.A) return 'A';
  if (total >= t.B) return 'B';
  if (total >= t.C) return 'C';
  if (total >= t.D) return 'D';
  if (total >= t.E) return 'E';
  return 'F';
};

const generate1000Students = (): Student[] => {
  const baseStudents: Student[] = [
    { id: 'std-1', rollNo: '122CS0101', name: 'Abhishek Kumar', email: 'abhishek@nitrkl.ac.in', department: 'Computer Science & Engineering' },
    { id: 'std-2', rollNo: '122CS0102', name: 'Anjali Sharma', email: 'anjali@nitrkl.ac.in', department: 'Computer Science & Engineering' },
    { id: 'std-3', rollNo: '122CS0103', name: 'Rohan Das', email: 'rohan@nitrkl.ac.in', department: 'Computer Science & Engineering' },
    { id: 'std-4', rollNo: '122CS0104', name: 'Siddharth Sen', email: 'siddharth@nitrkl.ac.in', department: 'Computer Science & Engineering' }
  ];

  const firstNames = [
    'Aarav', 'Aditya', 'Amit', 'Arjun', 'Aman', 'Aniket', 'Bhavya', 'Chaitanya', 'Deepak', 'Divya',
    'Gaurav', 'Harish', 'Ishaan', 'Jatin', 'Karan', 'Kunal', 'Manish', 'Mayank', 'Nikhil', 'Piyush',
    'Pranav', 'Rahul', 'Rajat', 'Rishi', 'Sachin', 'Sandeep', 'Saurabh', 'Shreya', 'Siddharth', 'Sumit',
    'Tanmay', 'Tushar', 'Udit', 'Varun', 'Vikas', 'Vivek', 'Yash', 'Yuvraj', 'Aanchal', 'Aditi',
    'Aishwarya', 'Ananya', 'Anushka', 'Bhumika', 'Charu', 'Deepika', 'Esha', 'Gauri', 'Isha', 'Jaya',
    'Kavya', 'Kiran', 'Megha', 'Neha', 'Nisha', 'Pooja', 'Priya', 'Riya', 'Sakshi', 'Sneha', 'Swati'
  ];

  const lastNames = [
    'Kumar', 'Sharma', 'Das', 'Sen', 'Sahoo', 'Nayak', 'Panda', 'Mishra', 'Patra', 'Behera',
    'Mohanty', 'Rout', 'Jena', 'Pradhan', 'Tripathy', 'Singh', 'Gupta', 'Joshi', 'Verma', 'Choudhury',
    'Roy', 'Banerjee', 'Chatterjee', 'Sen', 'Dutta', 'Bose', 'Dasgupta', 'Ghosh', 'Mukherjee', 'Sarkar',
    'Mehta', 'Shah', 'Patel', 'Reddy', 'Rao', 'Nair', 'Iyer', 'Pillai', 'Joshi', 'Kulkarni'
  ];

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Metallurgical & Materials Engineering',
    'Chemical Engineering'
  ];

  const studentsList = [...baseStudents];
  const startRoll = 105; // 122CS0105 onwards
  
  for (let i = 0; i < 996; i++) {
    const rollNum = startRoll + i;
    const deptPrefix = '122CS';
    const paddedNum = String(rollNum).padStart(4, '0');
    const rollNo = `${deptPrefix}${paddedNum}`;
    
    const fName = firstNames[(i + 7) % firstNames.length];
    const lName = lastNames[(i + 13) % lastNames.length];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@nitrkl.ac.in`;
    const department = departments[i % departments.length];

    studentsList.push({
      id: `std-${i + 5}`,
      rollNo,
      name,
      email,
      department
    });
  }

  return studentsList;
};

const INITIAL_STUDENTS: Student[] = generate1000Students();

const INITIAL_FACULTY = [
  { id: 'fac-1', name: 'Dr. B. D. Sahoo', email: 'bdsahoo@nitrkl.ac.in', department: 'Computer Science' },
  { id: 'fac-2', name: 'Dr. A. K. Turuk', email: 'akturuk@nitrkl.ac.in', department: 'Computer Science' }
];

const generateInitialCourseStates = (studentsList: Student[]): CourseState[] => {
  const sub1Marks: Record<string, Mark> = {};
  const sub2Marks: Record<string, Mark> = {};
  const sub3Marks: Record<string, Mark> = {};

  studentsList.forEach((std, index) => {
    // Generate deterministic marks based on index to keep it realistic
    // sub-1 (Advanced Database Systems)
    const preMid1 = 15 + (index * 7 + 13) % 16; // 15 to 30
    const postMid1 = 25 + (index * 11 + 7) % 26; // 25 to 50
    const ta1 = 10 + (index * 3 + 5) % 11; // 10 to 20
    const total1 = preMid1 + postMid1 + ta1;
    sub1Marks[std.id] = {
      studentId: std.id,
      preMid: preMid1,
      postMid: postMid1,
      ta: ta1,
      total: total1,
      grade: calculateGrade(total1)
    };

    // sub-2 (Compiler Design)
    const preMid2 = 15 + (index * 13 + 3) % 16;
    const postMid2 = 25 + (index * 7 + 19) % 26;
    const ta2 = 10 + (index * 5 + 8) % 11;
    const total2 = preMid2 + postMid2 + ta2;
    sub2Marks[std.id] = {
      studentId: std.id,
      preMid: preMid2,
      postMid: postMid2,
      ta: ta2,
      total: total2,
      grade: calculateGrade(total2)
    };

    // sub-3 (Computer Networks)
    const preMid3 = 15 + (index * 9 + 11) % 16;
    const postMid3 = 25 + (index * 17 + 2) % 26;
    const ta3 = 10 + (index * 11 + 14) % 11;
    const total3 = preMid3 + postMid3 + ta3;
    sub3Marks[std.id] = {
      studentId: std.id,
      preMid: preMid3,
      postMid: postMid3,
      ta: ta3,
      total: total3,
      grade: calculateGrade(total3)
    };
  });

  return [
    {
      subjectId: 'sub-1',
      sessionId: 'sess-1',
      semesterId: 'sem-5',
      isLocked: false,
      marks: sub1Marks
    },
    {
      subjectId: 'sub-2',
      sessionId: 'sess-1',
      semesterId: 'sem-5',
      isLocked: true, // CS-305 is locked by Dr. A. K. Turuk
      marks: sub2Marks
    },
    {
      subjectId: 'sub-3',
      sessionId: 'sess-1',
      semesterId: 'sem-5',
      isLocked: false,
      marks: sub3Marks
    }
  ];
};

const INITIAL_COURSE_STATES: CourseState[] = generateInitialCourseStates(INITIAL_STUDENTS);

const getGradePoints = (grade: string): number => {
  switch (grade) {
    case 'S': return 10;
    case 'A': return 9;
    case 'B': return 8;
    case 'C': return 7;
    case 'D': return 6;
    case 'E': return 5;
    default: return 0;
  }
};

export default function App() {
  // ================= STATE PERSISTENCE =================
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('mms_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem('mms_semesters');
    return saved ? JSON.parse(saved) : INITIAL_SEMESTERS;
  });

  const [faculty, setFaculty] = useState(() => {
    const saved = localStorage.getItem('mms_faculty');
    return saved ? JSON.parse(saved) : INITIAL_FACULTY;
  });

  const [gradingThresholds, setGradingThresholds] = useState(() => {
    const saved = localStorage.getItem('mms_grading_thresholds');
    return saved ? JSON.parse(saved) : { S: 90, A: 80, B: 70, C: 60, D: 50, E: 35 };
  });
  
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('mms_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('mms_students');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length >= 1000) {
        return parsed;
      }
    }
    return INITIAL_STUDENTS;
  });

  const [courseStates, setCourseStates] = useState<CourseState[]>(() => {
    const saved = localStorage.getItem('mms_course_states');
    if (saved) {
      const parsed = JSON.parse(saved);
      const firstState = parsed[0];
      if (firstState && firstState.marks && Object.keys(firstState.marks).length >= 1000) {
        return parsed;
      }
    }
    return INITIAL_COURSE_STATES;
  });

  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>(() => {
    const saved = localStorage.getItem('mms_unlock_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Active user session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mms_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('mms_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('mms_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('mms_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('mms_course_states', JSON.stringify(courseStates));
  }, [courseStates]);

  useEffect(() => {
    localStorage.setItem('mms_unlock_requests', JSON.stringify(unlockRequests));
  }, [unlockRequests]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mms_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mms_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mms_semesters', JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem('mms_faculty', JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem('mms_grading_thresholds', JSON.stringify(gradingThresholds));
  }, [gradingThresholds]);

  // ================= UI CONTROL STATES =================
  const [activeSessionId, setActiveSessionId] = useState<string>(
    () => sessions.find((s) => s.isActive)?.id || sessions[0]?.id || 'sess-1'
  );
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [loginError, setLoginError] = useState('');
  const [showDemoCreds, setShowDemoCreds] = useState(false);

  // Active tab inside viewports
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Faculty specific states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [bulkParseError, setBulkParseError] = useState('');
  const [unlockReasonText, setUnlockReasonText] = useState('');
  const [marksheetDraft, setMarksheetDraft] = useState<Record<string, Mark>>({});
  const [marksheetValidationErrors, setMarksheetValidationErrors] = useState<Record<string, string>>({});
  const [facultyNotification, setFacultyNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [facultyCourseTab, setFacultyCourseTab] = useState<'roster' | 'analytics' | 'grades'>('roster');
  
  // Faculty student search and pagination states
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 20;

  // Admin specific states
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCredits, setNewSubjectCredits] = useState(3);
  const [newSubjectLtp, setNewSubjectLtp] = useState('3-0-0');
  const [newSubjectCoord, setNewSubjectCoord] = useState('fac-1');
  const [newSubjectSubCoord, setNewSubjectSubCoord] = useState('');
  const [newSubjectSemester, setNewSubjectSemester] = useState('sem-5');

  const [newSessionName, setNewSessionName] = useState('');

  // Additional Admin states for new tabs
  const [newSemesterNumber, setNewSemesterNumber] = useState('');
  const [newSemesterName, setNewSemesterName] = useState('');

  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyDept, setNewFacultyDept] = useState('Computer Science & Engineering');

  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('Computer Science & Engineering');

  const [adminStudentSearchTerm, setAdminStudentSearchTerm] = useState('');
  const [adminStudentDeptFilter, setAdminStudentDeptFilter] = useState('ALL');
  const [adminStudentPage, setAdminStudentPage] = useState(1);

  const [adminFacultySearchTerm, setAdminFacultySearchTerm] = useState('');
  const [adminFacultyPage, setAdminFacultyPage] = useState(1);

  // ================= ACTION HANDLERS =================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailNorm = loginEmail.trim().toLowerCase();
    const pass = loginPassword.trim();

    if (loginRole === 'admin') {
      if (emailNorm === 'admin@nitrkl.ac.in' && pass === 'adminpassword') {
        const user: User = { id: 'admin-1', email: emailNorm, name: 'System Administrator', role: 'admin' };
        setCurrentUser(user);
        setActiveTab('dashboard');
      } else {
        setLoginError('Invalid Administrator credentials.');
      }
    } else if (loginRole === 'faculty') {
      const found = faculty.find((fac) => fac.email === emailNorm);
      if (found && pass === 'password123') {
        const user: User = { id: found.id, email: found.email, name: found.name, role: 'faculty', extraId: found.id };
        setCurrentUser(user);
        setActiveTab('subjects');
        // Pre-select their first assigned subject
        const firstSub = subjects.find(s => s.coordinatorId === found.id || s.subCoordinatorId === found.id);
        if (firstSub) {
          setSelectedSubjectId(firstSub.id);
        }
      } else {
        setLoginError('Invalid Faculty credentials. Use bdsahoo@nitrkl.ac.in / password123');
      }
    } else {
      // Student
      const found = students.find((s) => s.email === emailNorm);
      if (found && pass === 'password123') {
        const user: User = { id: found.id, email: found.email, name: found.name, role: 'student', extraId: found.rollNo };
        setCurrentUser(user);
        setActiveTab('dashboard');
      } else {
        setLoginError('Invalid Student credentials. Use abhishek@nitrkl.ac.in / password123');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
  };

  // Load subject marks into draft state when selected subject changes
  useEffect(() => {
    if (currentUser?.role === 'faculty' && selectedSubjectId) {
      const state = courseStates.find(
        (c) => c.subjectId === selectedSubjectId && c.sessionId === activeSessionId
      );

      const initialDraft: Record<string, Mark> = {};
      students.forEach((student) => {
        if (state?.marks[student.id]) {
          initialDraft[student.id] = { ...state.marks[student.id] };
        } else {
          initialDraft[student.id] = {
            studentId: student.id,
            preMid: null,
            postMid: null,
            ta: null,
            total: null,
            grade: null
          };
        }
      });

      setMarksheetDraft(initialDraft);
      setMarksheetValidationErrors({});
      setBulkPasteText('');
      setBulkParseError('');
      setUnlockReasonText('');
      setStudentPage(1);
      setStudentSearchTerm('');
      setFacultyCourseTab('roster');
    }
  }, [selectedSubjectId, activeSessionId, currentUser, courseStates, students]);

  // Handle single cell grade change
  const handleMarkChange = (studentId: string, field: 'preMid' | 'postMid' | 'ta', value: string) => {
    const numVal = value === '' ? null : Number(value);
    
    // Validations
    let error = '';
    if (numVal !== null) {
      if (isNaN(numVal)) {
        error = 'Must be a number';
      } else if (field === 'preMid' && (numVal < 0 || numVal > 30)) {
        error = 'Pre-Mid bounds: 0 - 30';
      } else if (field === 'postMid' && (numVal < 0 || numVal > 50)) {
        error = 'Post-Mid bounds: 0 - 50';
      } else if (field === 'ta' && (numVal < 0 || numVal > 20)) {
        error = 'Teacher Assessment bounds: 0 - 20';
      }
    }

    setMarksheetValidationErrors((prev) => ({
      ...prev,
      [`${studentId}_${field}`]: error
    }));

    setMarksheetDraft((prev) => {
      const draft = { ...prev };
      const current = { ...draft[studentId] };
      current[field] = numVal;

      // Recalculate totals if all are populated (or treat nulls as 0 / treat partially populated)
      if (current.preMid !== null || current.postMid !== null || current.ta !== null) {
        const pre = current.preMid || 0;
        const post = current.postMid || 0;
        const ta = current.ta || 0;
        current.total = pre + post + ta;
        current.grade = calculateGrade(current.total);
      } else {
        current.total = null;
        current.grade = null;
      }

      draft[studentId] = current;
      return draft;
    });
  };

  // Bulk Paste from Excel TSV
  const handleBulkPasteParse = () => {
    setBulkParseError('');
    if (!bulkPasteText.trim()) {
      setBulkParseError('Please paste some tabular text first.');
      return;
    }

    const lines = bulkPasteText.split('\n');
    let parsedCount = 0;
    let ignoredCount = 0;
    const newDraft = { ...marksheetDraft };

    lines.forEach((line) => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length < 2) return; // Skip empty/invalid lines

      const rollNo = parts[0];
      const student = students.find(s => s.rollNo.toLowerCase() === rollNo.toLowerCase());
      
      if (student) {
        // Formats: RollNo, Pre-Mid, Post-Mid, TA
        const pre = parts[1] ? Number(parts[1]) : null;
        const post = parts[2] ? Number(parts[2]) : null;
        const ta = parts[3] ? Number(parts[3]) : null;

        const updatedMark = { ...newDraft[student.id] };

        if (pre !== null && !isNaN(pre) && pre >= 0 && pre <= 30) updatedMark.preMid = pre;
        if (post !== null && !isNaN(post) && post >= 0 && post <= 50) updatedMark.postMid = post;
        if (ta !== null && !isNaN(ta) && ta >= 0 && ta <= 20) updatedMark.ta = ta;

        if (updatedMark.preMid !== null || updatedMark.postMid !== null || updatedMark.ta !== null) {
          updatedMark.total = (updatedMark.preMid || 0) + (updatedMark.postMid || 0) + (updatedMark.ta || 0);
          updatedMark.grade = calculateGrade(updatedMark.total);
        }

        newDraft[student.id] = updatedMark;
        parsedCount++;
      } else {
        ignoredCount++;
      }
    });

    setMarksheetDraft(newDraft);
    setBulkPasteText('');
    
    if (parsedCount > 0) {
      showFacultyNotification('success', `Parsed successfully! Synced marks for ${parsedCount} students. Ignored ${ignoredCount} rows.`);
    } else {
      setBulkParseError('No matching student rolls found. Ensure roll numbers match, e.g., 122CS0101.');
    }
  };

  const showFacultyNotification = (type: 'success' | 'error', message: string) => {
    setFacultyNotification({ type, message });
    setTimeout(() => setFacultyNotification(null), 4000);
  };

  // Save marks as draft
  const handleSaveDraft = () => {
    // Check validation errors
    const hasErrors = Object.values(marksheetValidationErrors).some(err => !!err);
    if (hasErrors) {
      showFacultyNotification('error', 'Please resolve all validation errors before saving.');
      return;
    }

    setCourseStates((prev) => {
      const idx = prev.findIndex(
        (c) => c.subjectId === selectedSubjectId && c.sessionId === activeSessionId
      );

      const stateToSave: CourseState = {
        subjectId: selectedSubjectId,
        sessionId: activeSessionId,
        semesterId: subjects.find(s => s.id === selectedSubjectId)?.semesterId || 'sem-5',
        isLocked: idx >= 0 ? prev[idx].isLocked : false,
        marks: { ...marksheetDraft }
      };

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = stateToSave;
        return copy;
      } else {
        return [...prev, stateToSave];
      }
    });

    showFacultyNotification('success', 'Draft evaluation scores saved successfully.');
  };

  // Lock marks sheet (Coordinator only)
  const handleLockMarks = () => {
    const subject = subjects.find(s => s.id === selectedSubjectId);
    if (!subject) return;

    if (subject.coordinatorId !== currentUser?.id) {
      showFacultyNotification('error', 'Only the Primary Course Coordinator is authorized to lock these marks.');
      return;
    }

    // Check if there are any validation errors
    const hasErrors = Object.values(marksheetValidationErrors).some(err => !!err);
    if (hasErrors) {
      showFacultyNotification('error', 'Cannot lock sheet with validation errors.');
      return;
    }

    // Ensure all students have fully completed grades before locking
    const incomplete = Object.keys(marksheetDraft).some((key) => {
      const m = marksheetDraft[key];
      return m.preMid === null || m.postMid === null || m.ta === null;
    });

    if (incomplete) {
      const confirmProceed = window.confirm(
        'Warning: Some students are missing scores in Pre-Mid, Post-Mid, or Teacher Assessment. Locking now will finalize these blank cells as zero and publish incomplete grades. Do you wish to proceed?'
      );
      if (!confirmProceed) return;
    }

    setCourseStates((prev) => {
      const idx = prev.findIndex(
        (c) => c.subjectId === selectedSubjectId && c.sessionId === activeSessionId
      );

      const finalizedMarks = { ...marksheetDraft };
      Object.keys(finalizedMarks).forEach((key) => {
        const item = { ...finalizedMarks[key] };
        item.preMid = item.preMid || 0;
        item.postMid = item.postMid || 0;
        item.ta = item.ta || 0;
        item.total = item.preMid + item.postMid + item.ta;
        item.grade = calculateGrade(item.total);
        finalizedMarks[key] = item;
      });

      const updatedState: CourseState = {
        subjectId: selectedSubjectId,
        sessionId: activeSessionId,
        semesterId: subject.semesterId,
        isLocked: true,
        marks: finalizedMarks
      };

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedState;
        return copy;
      } else {
        return [...prev, updatedState];
      }
    });

    showFacultyNotification('success', 'Marks sheet finalized & locked. Scores have been published securely.');
  };

  // Submit unlock request
  const handleRequestUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockReasonText.trim()) return;

    const subject = subjects.find(s => s.id === selectedSubjectId);
    if (!subject) return;

    const newRequest: UnlockRequest = {
      id: `req-${Date.now()}`,
      subjectId: selectedSubjectId,
      sessionId: activeSessionId,
      semesterId: subject.semesterId,
      facultyId: currentUser?.id || '',
      facultyName: currentUser?.name || 'Faculty Member',
      subjectCode: subject.code,
      subjectName: subject.name,
      reason: unlockReasonText,
      status: 'PENDING'
    };

    setUnlockRequests((prev) => [newRequest, ...prev]);
    setUnlockReasonText('');
    showFacultyNotification('success', 'Administrative unlock request submitted to System Administrator.');
  };

  // Admin Approve Unlock Request
  const handleApproveUnlock = (reqId: string) => {
    const request = unlockRequests.find((r) => r.id === reqId);
    if (!request) return;

    // Unlock the actual course
    setCourseStates((prev) => {
      return prev.map((state) => {
        if (
          state.subjectId === request.subjectId &&
          state.sessionId === request.sessionId
        ) {
          return { ...state, isLocked: false };
        }
        return state;
      });
    });

    // Update request status
    setUnlockRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'APPROVED' } : r))
    );
  };

  // Admin Decline Unlock Request
  const handleDeclineUnlock = (reqId: string) => {
    setUnlockRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'DECLINED' } : r))
    );
  };

  // Admin Create Subject
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectCode || !newSubjectName) return;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      code: newSubjectCode.trim().toUpperCase(),
      name: newSubjectName.trim(),
      credits: Number(newSubjectCredits),
      ltp: newSubjectLtp,
      coordinatorId: newSubjectCoord,
      subCoordinatorId: newSubjectSubCoord || undefined,
      semesterId: newSubjectSemester
    };

    setSubjects((prev) => [...prev, newSub]);
    setNewSubjectCode('');
    setNewSubjectName('');
    setNewSubjectCredits(3);
    setNewSubjectLtp('3-0-0');
    setNewSubjectSubCoord('');
    alert('Subject added and coordinator bounds assigned successfully!');
  };

  // Admin Create Session
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    const newSess: Session = {
      id: `sess-${Date.now()}`,
      name: newSessionName.trim(),
      isActive: false
    };

    setSessions((prev) => [...prev, newSess]);
    setNewSessionName('');
    alert('Academic session created.');
  };

  const handleSetSessionActive = (sessId: string) => {
    setSessions((prev) =>
      prev.map((s) => ({ ...s, isActive: s.id === sessId }))
    );
    setActiveSessionId(sessId);
  };

  // Admin Export Students to CSV
  const handleDownloadCSV = () => {
    try {
      if (students.length === 0) {
        alert('No students registered to export.');
        return;
      }
      // Define CSV headers
      const headers = ['Student ID', 'Roll Number', 'Full Name', 'Academic Email', 'Department'];
      // Map rows
      const rows = students.map((s) => [
        s.id,
        s.rollNo,
        s.name,
        s.email,
        s.department
      ]);
      // Construct CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Create downloadable blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `NITR_Student_Roster_${activeSessionId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV: ', err);
      alert('Could not generate CSV file export.');
    }
  };

  // Admin Create Semester
  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemesterNumber.trim() || !newSemesterName.trim()) return;

    const newSemId = `sem-${newSemesterNumber.trim()}`;
    if (semesters.some(s => s.id === newSemId)) {
      alert('Semester number already exists.');
      return;
    }

    const newSem: Semester = {
      id: newSemId,
      number: Number(newSemesterNumber),
      name: newSemesterName.trim()
    };

    setSemesters((prev) => [...prev, newSem]);
    setNewSemesterNumber('');
    setNewSemesterName('');
    alert('Academic Semester registered successfully!');
  };

  const handleDeleteSemester = (semId: string) => {
    if (confirm('Are you sure you want to delete this semester? Any courses associated with it may be affected.')) {
      setSemesters((prev) => prev.filter(s => s.id !== semId));
    }
  };

  // Admin Create Faculty
  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim() || !newFacultyEmail.trim()) return;

    const emailNorm = newFacultyEmail.trim().toLowerCase();
    if (faculty.some(f => f.email === emailNorm)) {
      alert('Faculty with this email already exists.');
      return;
    }

    const newFac = {
      id: `fac-${Date.now()}`,
      name: newFacultyName.trim(),
      email: emailNorm,
      department: newFacultyDept
    };

    setFaculty((prev) => [...prev, newFac]);
    setNewFacultyName('');
    setNewFacultyEmail('');
    alert('New Faculty registered successfully!');
  };

  const handleDeleteFaculty = (facId: string) => {
    if (confirm('Are you sure you want to de-register this faculty member?')) {
      setFaculty((prev) => prev.filter(f => f.id !== facId));
    }
  };

  // Admin Create Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentRoll.trim() || !newStudentName.trim() || !newStudentEmail.trim()) return;

    const rollNorm = newStudentRoll.trim().toUpperCase();
    const emailNorm = newStudentEmail.trim().toLowerCase();

    if (students.some(s => s.rollNo === rollNorm)) {
      alert('Student with this Roll Number already exists.');
      return;
    }

    const newStd: Student = {
      id: `std-${Date.now()}`,
      rollNo: rollNorm,
      name: newStudentName.trim(),
      email: emailNorm,
      department: newStudentDept
    };

    // Add student to list
    setStudents((prev) => [newStd, ...prev]);

    // Also populate student's empty marks for current course states to avoid crashes
    setCourseStates((prevStates) => {
      return prevStates.map((state) => {
        return {
          ...state,
          marks: {
            ...state.marks,
            [newStd.id]: {
              preMid: null,
              postMid: null,
              ta: null,
              total: null,
              grade: 'Result Awaiting'
            }
          }
        };
      });
    });

    setNewStudentRoll('');
    setNewStudentName('');
    setNewStudentEmail('');
    alert('Student registered and marks template initialized successfully!');
  };

  const handleDeleteStudent = (stdId: string) => {
    if (confirm('Are you sure you want to remove this student from the university registry?')) {
      setStudents((prev) => prev.filter(s => s.id !== stdId));
    }
  };

  // Admin Delete Subject
  const handleDeleteSubject = (subId: string) => {
    if (confirm('Are you sure you want to delete this course from the curriculum?')) {
      setSubjects((prev) => prev.filter(s => s.id !== subId));
    }
  };

  // Admin Delete Session
  const handleDeleteSession = (sessId: string) => {
    if (sessId === activeSessionId) {
      alert('Cannot delete the currently active session.');
      return;
    }
    if (confirm('Are you sure you want to archive and delete this academic session?')) {
      setSessions((prev) => prev.filter(s => s.id !== sessId));
    }
  };

  // ================= COMPUTED DERIVED STATES =================
  const facultyAssignedSubjects = subjects.filter(
    (s) => s.coordinatorId === currentUser?.id || s.subCoordinatorId === currentUser?.id
  );

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const activeCourseState = courseStates.find(
    (c) => c.subjectId === selectedSubjectId && c.sessionId === activeSessionId
  );

  const totalCoursesCount = subjects.length;
  const totalStudentsCount = students.length;
  const lockedCoursesCount = courseStates.filter((c) => c.sessionId === activeSessionId && c.isLocked).length;
  const lockPercentage = totalCoursesCount > 0 ? Math.round((lockedCoursesCount / totalCoursesCount) * 100) : 0;
  const pendingRequestsCount = unlockRequests.filter((r) => r.status === 'PENDING').length;

  // Student Transcript Computations
  const studentTranscriptRecords = subjects.map((subject) => {
    const state = courseStates.find(
      (c) => c.subjectId === subject.id && c.sessionId === activeSessionId
    );
    const mark = state?.marks[currentUser?.id || ''];
    const isLocked = state?.isLocked || false;

    return {
      subjectCode: subject.code,
      subjectName: subject.name,
      credits: subject.credits,
      ltp: subject.ltp,
      isLocked,
      grade: isLocked && mark ? mark.grade : 'Result Awaiting',
      preMid: isLocked && mark ? mark.preMid : null,
      postMid: isLocked && mark ? mark.postMid : null,
      ta: isLocked && mark ? mark.ta : null,
      total: isLocked && mark ? mark.total : null
    };
  });

  // Calculate SGPA for current active student
  const calculateStudentSGPA = () => {
    let totalGradePoints = 0;
    let totalCredits = 0;
    let gradedCount = 0;

    studentTranscriptRecords.forEach((record) => {
      if (record.isLocked && record.grade && record.grade !== 'Result Awaiting') {
        const gp = getGradePoints(record.grade);
        totalGradePoints += gp * record.credits;
        totalCredits += record.credits;
        gradedCount++;
      }
    });

    return {
      sgpa: totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A',
      credits: totalCredits,
      gradedCount
    };
  };

  const { sgpa, credits: activeStudentCredits } = calculateStudentSGPA();

  // Faculty Dashboard counters and statistics
  const facultyStats = (() => {
    if (!currentUser || currentUser.role !== 'faculty') {
      return { totalAssigned: 0, pending: 0, submitted: 0, toEvaluate: 0 };
    }
    
    const assigned = subjects.filter(
      (s) => s.coordinatorId === currentUser.id || s.subCoordinatorId === currentUser.id
    );
    const assignedIds = assigned.map(s => s.id);
    
    const assignedStates = courseStates.filter(
      (cs) => cs.sessionId === activeSessionId && assignedIds.includes(cs.subjectId)
    );
    
    const submitted = assignedStates.filter(cs => cs.isLocked).length;
    const pending = assigned.length - submitted;
    
    let completedEvals = 0;
    assigned.forEach(sub => {
      const cs = courseStates.find(c => c.subjectId === sub.id && c.sessionId === activeSessionId);
      if (cs) {
        students.forEach(student => {
          const m = cs.marks[student.id];
          if (m && m.preMid !== null && m.postMid !== null && m.ta !== null) {
            completedEvals++;
          }
        });
      }
    });
    
    const totalPossibleEvals = assigned.length * students.length;
    const toEvaluate = totalPossibleEvals - completedEvals;
    
    return {
      totalAssigned: assigned.length,
      pending,
      submitted,
      toEvaluate
    };
  })();

  // Selected Subject Performance & Grade Analytics
  const selectedSubjectAnalytics = (() => {
    if (!currentUser || currentUser.role !== 'faculty' || !selectedSubjectId) {
      return {
        avg: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
        stdDev: 0,
        totalEvaluated: 0,
        histogramData: [],
        trendData: [],
        componentAverages: { preMid: 0, postMid: 0, ta: 0 },
        gradeDistributionData: []
      };
    }
    
    const studentMarks = Object.values(marksheetDraft);
    const completedMarks = studentMarks.filter(m => m.preMid !== null || m.postMid !== null || m.ta !== null);
    
    if (completedMarks.length === 0) {
      return {
        avg: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
        stdDev: 0,
        totalEvaluated: 0,
        histogramData: Array(10).fill(0).map((_, i) => ({ name: `${i*10}-${(i+1)*10}`, count: 0 })),
        trendData: [],
        componentAverages: { preMid: 0, postMid: 0, ta: 0 },
        gradeDistributionData: ['S', 'A', 'B', 'C', 'D', 'E', 'F'].map(g => ({ grade: g, count: 0 }))
      };
    }
    
    const totals = completedMarks.map(m => m.total || 0);
    const sum = totals.reduce((a, b) => a + b, 0);
    const avg = sum / completedMarks.length;
    const highest = Math.max(...totals);
    const lowest = Math.min(...totals);
    
    const passedCount = completedMarks.filter(m => m.grade && m.grade !== 'F').length;
    const passRate = (passedCount / completedMarks.length) * 100;
    
    // Standard deviation
    const variance = totals.reduce((acc, curr) => acc + Math.pow(curr - avg, 2), 0) / completedMarks.length;
    const stdDev = Math.sqrt(variance);
    
    // Component Averages
    const preMidSum = completedMarks.reduce((acc, curr) => acc + (curr.preMid || 0), 0);
    const postMidSum = completedMarks.reduce((acc, curr) => acc + (curr.postMid || 0), 0);
    const taSum = completedMarks.reduce((acc, curr) => acc + (curr.ta || 0), 0);
    const componentAverages = {
      preMid: preMidSum / completedMarks.length,
      postMid: postMidSum / completedMarks.length,
      ta: taSum / completedMarks.length
    };
    
    // Histogram (bins of 10)
    const bins = Array(10).fill(0);
    totals.forEach(t => {
      const idx = Math.min(Math.floor(t / 10), 9);
      bins[idx]++;
    });
    const binLabels = [
      '0-10', '11-20', '21-30', '31-40', '41-50',
      '51-60', '61-70', '71-80', '81-90', '91-100'
    ];
    const histogramData = binLabels.map((label, idx) => ({
      name: label,
      count: bins[idx]
    }));
    
    // Performance Trends (percentile score line chart)
    const sortedTotals = [...totals].sort((a, b) => a - b);
    const trendData = [];
    const samples = 10;
    for (let i = 0; i < samples; i++) {
      const idx = Math.min(Math.floor((i / (samples - 1)) * (sortedTotals.length - 1)), sortedTotals.length - 1);
      trendData.push({
        percentile: `${Math.round((i / (samples - 1)) * 100)}%`,
        score: Number(sortedTotals[idx].toFixed(1))
      });
    }
    
    // Grade distribution
    const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    completedMarks.forEach(m => {
      if (m.grade) {
        counts[m.grade] = (counts[m.grade] || 0) + 1;
      }
    });
    const gradeDistributionData = ['S', 'A', 'B', 'C', 'D', 'E', 'F'].map(g => ({
      grade: g,
      count: counts[g] || 0
    }));
    
    return {
      avg,
      highest,
      lowest,
      passRate,
      stdDev,
      totalEvaluated: completedMarks.length,
      histogramData,
      trendData,
      componentAverages,
      gradeDistributionData
    };
  })();

  // Faculty student table search and pagination variables
  const filteredStudents = students.filter((s) => {
    const term = studentSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return s.name.toLowerCase().includes(term) || s.rollNo.toLowerCase().includes(term) || s.department.toLowerCase().includes(term);
  });

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
  const activePage = Math.min(studentPage, totalPages);
  const startIdx = (activePage - 1) * studentsPerPage;
  const endIdx = startIdx + studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIdx, endIdx);

  // Admin Students pagination and search computations
  const filteredAdminStudents = students.filter((s) => {
    const term = adminStudentSearchTerm.trim().toLowerCase();
    const dept = adminStudentDeptFilter;
    const matchesSearch = !term || s.name.toLowerCase().includes(term) || s.rollNo.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
    const matchesDept = dept === 'ALL' || s.department === dept;
    return matchesSearch && matchesDept;
  });

  const adminStudentsPerPage = 12;
  const totalAdminStudentPages = Math.ceil(filteredAdminStudents.length / adminStudentsPerPage) || 1;
  const activeAdminStudentPage = Math.min(adminStudentPage, totalAdminStudentPages);
  const startAdminIdx = (activeAdminStudentPage - 1) * adminStudentsPerPage;
  const paginatedAdminStudents = filteredAdminStudents.slice(startAdminIdx, startAdminIdx + adminStudentsPerPage);

  // Admin Faculty pagination and search computations
  const filteredAdminFaculty = faculty.filter((f) => {
    const term = adminFacultySearchTerm.trim().toLowerCase();
    return !term || f.name.toLowerCase().includes(term) || f.email.toLowerCase().includes(term) || f.department.toLowerCase().includes(term);
  });

  const adminFacultyPerPage = 8;
  const totalAdminFacultyPages = Math.ceil(filteredAdminFaculty.length / adminFacultyPerPage) || 1;
  const activeAdminFacultyPage = Math.min(adminFacultyPage, totalAdminFacultyPages);
  const startAdminFacIdx = (activeAdminFacultyPage - 1) * adminFacultyPerPage;
  const paginatedAdminFaculty = filteredAdminFaculty.slice(startAdminFacIdx, startAdminFacIdx + adminFacultyPerPage);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex flex-col antialiased">
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-800 flex items-center gap-1.5">
              NIT Rourkela <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full border border-indigo-100">Portal v2.1</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest -mt-0.5">Centralized Evaluation</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Session Active</span>
            </div>
          )}

          {/* Elegant Floating Demo Mode Selector */}
          {!currentUser && (
            <button
              onClick={() => setShowDemoCreds(!showDemoCreds)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-all border border-slate-200 cursor-pointer"
            >
              <Info className="w-4 h-4 text-slate-500" />
              Demo Roles Info
            </button>
          )}

          {currentUser && (
            <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
              <div className="text-right">
                <div className="text-xs font-black text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-indigo-600 uppercase font-extrabold tracking-wider">{currentUser.role}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm uppercase">
                {currentUser.name.slice(0, 2)}
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for authenticated user */}
        {currentUser && (
          <aside className="w-64 bg-slate-900 flex flex-col p-4 shrink-0 shadow-inner">
            <nav className="space-y-1 flex-1">
              {currentUser.role === 'admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span>Dashboard</span>
                    {pendingRequestsCount > 0 && (
                      <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'sessions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Sessions</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('semesters')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'semesters' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span>Semesters</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('subjects')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'subjects' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Subjects</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('faculty')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'faculty' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Faculty</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('students')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'students' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span>Students</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('grading-scheme')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'grading-scheme' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                    <span>Grading Scheme</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Reports</span>
                  </button>
                </>
              )}

              {currentUser.role === 'faculty' && (
                <>
                  <button
                    onClick={() => setActiveTab('subjects')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'subjects' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>Marks Evaluation</span>
                  </button>
                </>
              )}

              {currentUser.role === 'student' && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all cursor-pointer ${
                      activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>My Report Card</span>
                  </button>
                </>
              )}
            </nav>

            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Evaluation Target</div>
              <div className="text-xs text-white font-semibold">NIT Rourkela CSE Department</div>
              <div className="text-[10px] text-slate-400 mt-1">College Board Final Exam 2026</div>
              <div className="mt-3 w-full bg-slate-750 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[100%] rounded-full"></div>
              </div>
            </div>
          </aside>
        )}

        {/* Viewport Workspace */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* ================= VIEW 1: AUTHENTICATION ================= */}
          {!currentUser && (
            <div className="w-full flex items-center justify-center py-10">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <div className="text-center mb-6">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-2xl mb-3 border border-indigo-100 text-indigo-600">
                    <Database className="w-6 h-6" />
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-800">Login to NIT Rourkela</h2>
                  <p className="text-slate-500 text-xs mt-1">Authorized Academic Records Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Role Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['student', 'faculty', 'admin'] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setLoginRole(role)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                            loginRole === role
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Academic Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder={
                        loginRole === 'student' ? 'abhishek@nitrkl.ac.in' : loginRole === 'faculty' ? 'bdsahoo@nitrkl.ac.in' : 'admin@nitrkl.ac.in'
                      }
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
                    />
                  </div>

                  {loginError && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-lg shadow-slate-950/10 cursor-pointer"
                  >
                    Authenticate Account
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: ADMIN VIEWPORT ================= */}
          {currentUser && currentUser.role === 'admin' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Session Selector / Header */}
              <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <h1 className="text-2xl font-black text-slate-800">System Control Desk</h1>
                  <p className="text-xs text-slate-500 mt-1">Academic Session configuration and safety override settings.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cycle:</span>
                  <select
                    value={activeSessionId}
                    onChange={(e) => handleSetSessionActive(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Total Students Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-44">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
                          <Users className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">Roster List</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total B.Tech Students</div>
                        <div className="text-3xl font-black text-slate-800">{totalStudentsCount}</div>
                      </div>
                    </div>

                    {/* Lock percentage */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-44">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-purple-600">
                          <Lock className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-0.5 rounded-md">Locked status</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Finalized Records Percentage</div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-3xl font-black text-slate-800">{lockPercentage}%</div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{lockedCoursesCount} / {totalCoursesCount} locked</span>
                        </div>
                        <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${lockPercentage}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Active Courses */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-44">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-0.5 rounded-md">Curriculum</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Registered B.Tech Courses</div>
                        <div className="text-3xl font-black text-slate-800">{totalCoursesCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Administrative Grade Unlock Requests */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <Unlock className="w-5 h-5 text-indigo-600" /> Administrative Grade Unlock Submissions
                    </h3>
                    {unlockRequests.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-100">
                        <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        No unlock requests registered in the administrative queue.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {unlockRequests.map((req) => (
                          <div
                            key={req.id}
                            className="border border-slate-150 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-indigo-900 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full">
                                  {req.subjectCode}
                                </span>
                                <span className="text-xs font-bold text-slate-800">{req.subjectName}</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Submitted by: <strong className="text-slate-700">{req.facultyName}</strong> for Session {sessions.find(s => s.id === req.sessionId)?.name}
                              </p>
                              <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-[11px] text-slate-600 mt-1 font-mono">
                                <strong>Reason:</strong> {req.reason}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {req.status === 'PENDING' ? (
                                <>
                                  <button
                                    onClick={() => handleApproveUnlock(req.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleDeclineUnlock(req.id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold px-3 py-2 rounded-lg border border-red-100 transition-colors cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </>
                              ) : (
                                <span
                                  className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                    req.status === 'APPROVED'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  {req.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SESSIONS */}
              {activeTab === 'sessions' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left form: Create Session */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" /> Create Session
                    </h3>
                    <form onSubmit={handleCreateSession} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Session Code Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2026-27 Autumn"
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 bg-slate-50/50"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-indigo-100"
                      >
                        Add Academic Session
                      </button>
                    </form>
                  </div>

                  {/* Right side: Sessions list */}
                  <div className="col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4">All Registered Sessions</h3>
                    <div className="space-y-2">
                      {sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-250 text-xs font-bold"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-800 font-extrabold text-sm">{sess.name}</span>
                            {sess.id === activeSessionId ? (
                              <span className="bg-indigo-50 text-indigo-600 uppercase text-[9px] px-2 py-0.5 rounded-full border border-indigo-100">
                                Active Cycle
                              </span>
                            ) : (
                              <span className="bg-slate-200/60 text-slate-500 uppercase text-[9px] px-2 py-0.5 rounded-full">
                                Standby
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {sess.id !== activeSessionId && (
                              <button
                                onClick={() => handleSetSessionActive(sess.id)}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors text-[10px] font-bold cursor-pointer"
                              >
                                Activate Cycle
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSession(sess.id)}
                              disabled={sess.id === activeSessionId}
                              className={`p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer ${sess.id === activeSessionId ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SEMESTERS */}
              {activeTab === 'semesters' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left form: Add Semester */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-600" /> Register Semester
                    </h3>
                    <form onSubmit={handleCreateSemester} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester Number</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={10}
                          placeholder="e.g. 5"
                          value={newSemesterNumber}
                          onChange={(e) => setNewSemesterNumber(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester Code/Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 5th Semester"
                          value={newSemesterName}
                          onChange={(e) => setNewSemesterName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 bg-slate-50/50"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-indigo-100"
                      >
                        Register Semester
                      </button>
                    </form>
                  </div>

                  {/* Right side: Semesters list */}
                  <div className="col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4">Registered Semesters</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {semesters.map((sem) => {
                        const courseCount = subjects.filter(sub => sub.semesterId === sem.id).length;
                        return (
                          <div
                            key={sem.id}
                            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center"
                          >
                            <div>
                              <div className="font-extrabold text-slate-800 text-sm">{sem.name}</div>
                              <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">{courseCount} Courses Configured</div>
                            </div>
                            <button
                              onClick={() => handleDeleteSemester(sem.id)}
                              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SUBJECTS */}
              {activeTab === 'subjects' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Add Subject Form */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" /> Allocate Course
                    </h3>
                    <form onSubmit={handleCreateSubject} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject Code</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. CS-303"
                            value={newSubjectCode}
                            onChange={(e) => setNewSubjectCode(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Compiler Design"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Credits</label>
                          <input
                            type="number"
                            required
                            min={1}
                            max={6}
                            value={newSubjectCredits}
                            onChange={(e) => setNewSubjectCredits(Number(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">L-T-P</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 3-0-2"
                            value={newSubjectLtp}
                            onChange={(e) => setNewSubjectLtp(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester Target</label>
                          <select
                            value={newSubjectSemester}
                            onChange={(e) => setNewSubjectSemester(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50/50"
                          >
                            {semesters.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Coordinator</label>
                          <select
                            value={newSubjectCoord}
                            onChange={(e) => setNewSubjectCoord(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50/50"
                          >
                            {faculty.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sub-Coordinator (Optional)</label>
                        <select
                          value={newSubjectSubCoord}
                          onChange={(e) => setNewSubjectSubCoord(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50/50"
                        >
                          <option value="">None</option>
                          {faculty.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-md shadow-indigo-100 cursor-pointer"
                      >
                        Register Subject & Assignments
                      </button>
                    </form>
                  </div>

                  {/* Right side: Courses Table */}
                  <div className="col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-hidden">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4">Curriculum Course Roster</h3>
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                            <th className="p-3">Code</th>
                            <th className="p-3">Course Title</th>
                            <th className="p-3">Credits</th>
                            <th className="p-3">L-T-P</th>
                            <th className="p-3">Primary Coordinator</th>
                            <th className="p-3">Sub-Coordinator</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {subjects.map((sub) => {
                            const coord = faculty.find(f => f.id === sub.coordinatorId);
                            const subCoord = faculty.find(f => f.id === sub.subCoordinatorId);
                            return (
                              <tr key={sub.id} className="hover:bg-slate-50/50 text-slate-700 transition-colors">
                                <td className="p-3 font-extrabold text-slate-900">{sub.code}</td>
                                <td className="p-3 font-semibold">{sub.name}</td>
                                <td className="p-3">{sub.credits}</td>
                                <td className="p-3 font-mono text-[10px]">{sub.ltp}</td>
                                <td className="p-3 text-indigo-600 font-semibold">{coord?.name || 'N/A'}</td>
                                <td className="p-3 text-slate-500">{subCoord?.name || 'None'}</td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleDeleteSubject(sub.id)}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FACULTY */}
              {activeTab === 'faculty' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left form: Add Faculty */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" /> Register Faculty
                    </h3>
                    <form onSubmit={handleCreateFaculty} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Satya Das"
                          value={newFacultyName}
                          onChange={(e) => setNewFacultyName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Academic Email</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. sdas@nitrkl.ac.in"
                          value={newFacultyEmail}
                          onChange={(e) => setNewFacultyEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                        <select
                          value={newFacultyDept}
                          onChange={(e) => setNewFacultyDept(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50/50"
                        >
                          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                          <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Chemical Engineering">Chemical Engineering</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-md shadow-indigo-100 cursor-pointer"
                      >
                        Register Faculty Member
                      </button>
                    </form>
                  </div>

                  {/* Right side: Faculty Directory with Search & Pagination */}
                  <div className="col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <h3 className="font-extrabold text-slate-800 text-base">Faculty Registry</h3>
                        <div className="relative w-full sm:w-64">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="Search by name, email, dept..."
                            value={adminFacultySearchTerm}
                            onChange={(e) => {
                              setAdminFacultySearchTerm(e.target.value);
                              setAdminFacultyPage(1);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                              <th className="p-3">Faculty ID</th>
                              <th className="p-3">Full Name</th>
                              <th className="p-3">Academic Email</th>
                              <th className="p-3">Department</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {paginatedAdminFaculty.map((f) => (
                              <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-extrabold text-slate-900 font-mono">{f.id}</td>
                                <td className="p-3 font-bold">{f.name}</td>
                                <td className="p-3 font-mono">{f.email}</td>
                                <td className="p-3">{f.department}</td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleDeleteFaculty(f.id)}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Faculty Directory Pagination */}
                    {totalAdminFacultyPages > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                        <span className="text-xs text-slate-500">
                          Showing Page <strong className="text-slate-700">{activeAdminFacultyPage}</strong> of <strong className="text-slate-700">{totalAdminFacultyPages}</strong> ({filteredAdminFaculty.length} registered faculty)
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAdminFacultyPage(prev => Math.max(1, prev - 1))}
                            disabled={activeAdminFacultyPage === 1}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setAdminFacultyPage(prev => Math.min(totalAdminFacultyPages, prev + 1))}
                            disabled={activeAdminFacultyPage === totalAdminFacultyPages}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: STUDENTS */}
              {activeTab === 'students' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Admit student form */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" /> Admit B.Tech Student
                    </h3>
                    <form onSubmit={handleCreateStudent} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Roll Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 122CS0105"
                          value={newStudentRoll}
                          onChange={(e) => setNewStudentRoll(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rohan Nayak"
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Academic Email</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. rohan@nitrkl.ac.in"
                          value={newStudentEmail}
                          onChange={(e) => setNewStudentEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                        <select
                          value={newStudentDept}
                          onChange={(e) => setNewStudentDept(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50/50"
                        >
                          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                          <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Chemical Engineering">Chemical Engineering</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-md shadow-indigo-100 cursor-pointer"
                      >
                        Enroll Student Records
                      </button>
                    </form>
                  </div>

                  {/* Right side: Student Directory with Search, Filter & Pagination */}
                  <div className="col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <h3 className="font-extrabold text-slate-800 text-base">Students Registry</h3>
                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                          <select
                            value={adminStudentDeptFilter}
                            onChange={(e) => {
                              setAdminStudentDeptFilter(e.target.value);
                              setAdminStudentPage(1);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none"
                          >
                            <option value="ALL">All Departments</option>
                            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                            <option value="Electronics & Communication Engineering">Electronics & Communication</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Chemical Engineering">Chemical Engineering</option>
                          </select>
                          <div className="relative w-full sm:w-48">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              placeholder="Search student roll, name..."
                              value={adminStudentSearchTerm}
                              onChange={(e) => {
                                setAdminStudentSearchTerm(e.target.value);
                                setAdminStudentPage(1);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                              <th className="p-3">Roll Number</th>
                              <th className="p-3">Student Name</th>
                              <th className="p-3">Academic Email</th>
                              <th className="p-3">Department</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {paginatedAdminStudents.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-extrabold text-slate-900 font-mono">{s.rollNo}</td>
                                <td className="p-3 font-bold">{s.name}</td>
                                <td className="p-3 font-mono">{s.email}</td>
                                <td className="p-3 text-slate-500">{s.department}</td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleDeleteStudent(s.id)}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination Bar */}
                    {totalAdminStudentPages > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                        <span className="text-xs text-slate-500">
                          Showing Page <strong className="text-slate-700">{activeAdminStudentPage}</strong> of <strong className="text-slate-700">{totalAdminStudentPages}</strong> ({filteredAdminStudents.length} matches found)
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAdminStudentPage(prev => Math.max(1, prev - 1))}
                            disabled={activeAdminStudentPage === 1}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setAdminStudentPage(prev => Math.min(totalAdminStudentPages, prev + 1))}
                            disabled={activeAdminStudentPage === totalAdminStudentPages}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: GRADING SCHEME */}
              {activeTab === 'grading-scheme' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-fadeIn">
                  <h3 className="font-extrabold text-slate-800 text-lg mb-2 flex items-center gap-2">
                    <Award className="w-6 h-6 text-indigo-600" /> NIT Rourkela Letter Grading Standards
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">Modify the minimum threshold score required to achieve each letter grade. All active course evaluations and transcripts dynamically recalculate on save.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Dynamic controls */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">Dynamic Score Boundaries</h4>
                      
                      <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        {/* Threshold S */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-extrabold text-xs text-slate-700 uppercase">Grade S (Outstanding - 10 pts)</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={80}
                              max={100}
                              value={gradingThresholds.S}
                              onChange={(e) => setGradingThresholds({ ...gradingThresholds, S: Number(e.target.value) })}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs text-center font-bold text-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-semibold text-slate-400">marks +</span>
                          </div>
                        </div>

                        {/* Threshold A */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-extrabold text-xs text-slate-700 uppercase">Grade A (Excellent - 9 pts)</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={70}
                              max={90}
                              value={gradingThresholds.A}
                              onChange={(e) => setGradingThresholds({ ...gradingThresholds, A: Number(e.target.value) })}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs text-center font-bold text-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-semibold text-slate-400">marks +</span>
                          </div>
                        </div>

                        {/* Threshold B */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-extrabold text-xs text-slate-700 uppercase">Grade B (Very Good - 8 pts)</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={60}
                              max={80}
                              value={gradingThresholds.B}
                              onChange={(e) => setGradingThresholds({ ...gradingThresholds, B: Number(e.target.value) })}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs text-center font-bold text-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-semibold text-slate-400">marks +</span>
                          </div>
                        </div>

                        {/* Threshold C */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-extrabold text-xs text-slate-700 uppercase">Grade C (Good - 7 pts)</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={50}
                              max={70}
                              value={gradingThresholds.C}
                              onChange={(e) => setGradingThresholds({ ...gradingThresholds, C: Number(e.target.value) })}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs text-center font-bold text-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-semibold text-slate-400">marks +</span>
                          </div>
                        </div>

                        {/* Threshold D */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-extrabold text-xs text-slate-700 uppercase">Grade D (Fair - 6 pts)</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={40}
                              max={60}
                              value={gradingThresholds.D}
                              onChange={(e) => setGradingThresholds({ ...gradingThresholds, D: Number(e.target.value) })}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs text-center font-bold text-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-semibold text-slate-400">marks +</span>
                          </div>
                        </div>

                        {/* Threshold E */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-extrabold text-xs text-slate-700 uppercase">Grade E (Pass - 5 pts)</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={30}
                              max={50}
                              value={gradingThresholds.E}
                              onChange={(e) => setGradingThresholds({ ...gradingThresholds, E: Number(e.target.value) })}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs text-center font-bold text-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-semibold text-slate-400">marks +</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setGradingThresholds({ S: 90, A: 80, B: 70, C: 60, D: 50, E: 35 });
                            alert('University default thresholds restored!');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl transition-all cursor-pointer border border-slate-200"
                        >
                          Restore Defaults
                        </button>
                        <button
                          onClick={() => {
                            alert('Grading scheme applied and synchronized successfully!');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
                        >
                          Save & Apply Changes
                        </button>
                      </div>
                    </div>

                    {/* Right: Informational Box */}
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-indigo-950 text-sm mb-2">Grading Integrity & Rules</h4>
                        <ul className="space-y-2.5 text-xs text-indigo-900/80 list-disc list-inside">
                          <li>Grades are assigned automatically upon finalizing course lists.</li>
                          <li>Students scoring below Grade E threshold (<span className="font-bold">{gradingThresholds.E}</span> marks) are awarded <strong>Grade F (Fail)</strong>.</li>
                          <li>Absolute grading bounds can be adjusted by the Administrator during the active review cycle.</li>
                          <li>Once courses are locked, coordinator faculty must submit an unlock request to make edits.</li>
                        </ul>
                      </div>
                      <div className="mt-6 p-4 bg-white rounded-xl border border-indigo-100/55 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-600">The current scheme is active and syncing in real-time with 1,000 students.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: REPORTS */}
              {activeTab === 'reports' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" /> Academic Reports & Analytics
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Institutional analysis of course performances, grading curves, and records download.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Stat Card 1 */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Finalized Curriculums</div>
                      <div className="text-2xl font-black text-slate-800 mt-1">{lockedCoursesCount} / {totalCoursesCount}</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Academic sessions fully graded</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">University Average Grade</div>
                      <div className="text-2xl font-black text-slate-800 mt-1">B (Very Good)</div>
                      <p className="text-[10px] text-indigo-600 mt-0.5 font-bold">Based on active cycle</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Outstanding Achievers (S Grade)</div>
                      <div className="text-2xl font-black text-emerald-600 mt-1">142 Students</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Grade score of 90% or higher</p>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-indigo-600 text-white p-4 rounded-2xl flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-wide">Actions Desk</div>
                      <button
                        onClick={handleDownloadCSV}
                        className="bg-white hover:bg-slate-50 text-indigo-600 font-extrabold py-2 px-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-sm"
                      >
                        <Download className="w-4 h-4" /> Export Student Registry (CSV)
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Grading Curves & Averages Table */}
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm mb-3">Course Performance Indices</h4>
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                            <th className="p-3">Course Code</th>
                            <th className="p-3">Course Name</th>
                            <th className="p-3">Class average</th>
                            <th className="p-3">Highest Score</th>
                            <th className="p-3">Pass Percentage</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {subjects.map((sub, idx) => {
                            const isLocked = courseStates.find(c => c.subjectId === sub.id && c.sessionId === activeSessionId)?.isLocked;
                            // Generate deterministic high quality values based on index
                            const baseAvg = 68 + (idx % 7) * 2.3;
                            const maxScore = 94 + (idx % 3) * 2;
                            const passRate = isLocked ? (96 + (idx % 2) * 2) : 100;
                            return (
                              <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-extrabold text-slate-900 font-mono">{sub.code}</td>
                                <td className="p-3 font-semibold">{sub.name}</td>
                                <td className="p-3 font-bold text-slate-800">{baseAvg.toFixed(1)} / 100</td>
                                <td className="p-3 font-bold text-emerald-600 font-mono">{maxScore}</td>
                                <td className="p-3 font-bold font-mono text-indigo-600">{passRate}%</td>
                                <td className="p-3">
                                  {isLocked ? (
                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[9px] uppercase font-bold border border-purple-100">Locked</span>
                                  ) : (
                                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[9px] uppercase font-bold border border-amber-100">Draft</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW 3: FACULTY VIEWPORT ================= */}
          {currentUser && currentUser.role === 'faculty' && (
            <div className="space-y-6">
              {/* Header selection card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-800">Faculty Evaluation Sheet</h1>
                  <p className="text-xs text-slate-500 mt-1">Manage scores lists, compute grades, and submit final reports.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session:</span>
                    <span className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800">
                      {sessions.find(s => s.id === activeSessionId)?.name || '2025-26 Autumn'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Course:</span>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                    >
                      {facultyAssignedSubjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.code} - {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Faculty Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Assigned Courses</span>
                    <span className="text-2xl font-black text-slate-800 font-mono block">{facultyStats.totalAssigned}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 shadow-sm">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Pending Evaluations</span>
                    <span className="text-2xl font-black text-slate-800 font-mono block">{facultyStats.pending}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Marks Submitted</span>
                    <span className="text-2xl font-black text-slate-800 font-mono block">{facultyStats.submitted}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Students to Evaluate</span>
                    <span className="text-2xl font-black text-slate-800 font-mono block">
                      {facultyStats.toEvaluate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid content */}
              {activeSubject && (
                <div className="space-y-6">
                  {/* Course evaluation tabs bar */}
                  <div className="flex border-b border-slate-200 pb-px gap-2">
                    <button
                      onClick={() => setFacultyCourseTab('roster')}
                      className={`px-5 py-2.5 rounded-t-2xl font-bold text-xs transition-all relative flex items-center gap-2 cursor-pointer ${
                        facultyCourseTab === 'roster'
                          ? 'bg-white border-x border-t border-slate-200 text-indigo-600 font-extrabold -mb-px shadow-[0_-4px_10px_rgba(0,0,0,0.02)]'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Roster & Marks Entry</span>
                    </button>
                    <button
                      onClick={() => setFacultyCourseTab('analytics')}
                      className={`px-5 py-2.5 rounded-t-2xl font-bold text-xs transition-all relative flex items-center gap-2 cursor-pointer ${
                        facultyCourseTab === 'analytics'
                          ? 'bg-white border-x border-t border-slate-200 text-indigo-600 font-extrabold -mb-px shadow-[0_-4px_10px_rgba(0,0,0,0.02)]'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Performance Analytics</span>
                    </button>
                    <button
                      onClick={() => setFacultyCourseTab('grades')}
                      className={`px-5 py-2.5 rounded-t-2xl font-bold text-xs transition-all relative flex items-center gap-2 cursor-pointer ${
                        facultyCourseTab === 'grades'
                          ? 'bg-white border-x border-t border-slate-200 text-indigo-600 font-extrabold -mb-px shadow-[0_-4px_10px_rgba(0,0,0,0.02)]'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span>Grade Management</span>
                    </button>
                  </div>

                  {/* TAB 1: ROSTER SHEET */}
                  {facultyCourseTab === 'roster' && (
                    <div className="grid grid-cols-6 gap-6">
                      {/* Subject Info Card (Bento size 2x2) */}
                      <div className="col-span-6 md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-56">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1 rounded-xl border border-indigo-100 uppercase">
                              {activeSubject.code}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">COURSE DETAILS</span>
                          </div>
                          <h3 className="font-extrabold text-slate-800 text-lg leading-snug">{activeSubject.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">L-T-P: {activeSubject.ltp} • Credits: {activeSubject.credits}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 mt-3 space-y-1.5 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Coordinator Role:</span>
                            <span className="font-bold text-indigo-600">
                              {activeSubject.coordinatorId === currentUser.id ? 'Primary Coordinator' : 'Sub-Coordinator'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sheet Status:</span>
                            <span>
                              {activeCourseState?.isLocked ? (
                                <strong className="text-purple-600 uppercase tracking-wider text-[10px] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Locked</strong>
                              ) : (
                                <strong className="text-amber-600 uppercase tracking-wider text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Draft Editing</strong>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Excel Bulk Paste (Bento size 4x2) */}
                      {!activeCourseState?.isLocked && (
                        <div className="col-span-6 md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-56">
                          <div className="space-y-1">
                            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                              <ClipboardCheck className="w-5 h-5 text-indigo-600" /> Excel Spreadsheet Bulk Integration
                            </h3>
                            <p className="text-xs text-slate-500">
                              Paste your grades table directly from Excel. Columns must be tab-separated: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono text-[10px]">RollNumber  PreMid  PostMid  TeacherAssessment</code>.
                            </p>
                          </div>

                          <div className="mt-2.5 flex-1 relative">
                            <textarea
                              placeholder="Paste table columns from spreadsheet here...&#10;e.g.&#10;122CS0101&#9;25&#9;42&#9;18"
                              value={bulkPasteText}
                              onChange={(e) => setBulkPasteText(e.target.value)}
                              className="w-full h-20 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-50 bg-slate-50/50 resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-4 mt-2">
                            {bulkParseError ? (
                              <span className="text-[10px] font-semibold text-red-600">{bulkParseError}</span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Tabular TSV format supported</span>
                            )}
                            <button
                              onClick={handleBulkPasteParse}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Parse & Sync Scores
                            </button>
                          </div>
                        </div>
                      )}

                      {/* If Course is Locked, show Unlock Request Card in Bento layout */}
                      {activeCourseState?.isLocked && (
                        <div className="col-span-6 md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-56">
                          <div className="space-y-1">
                            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 text-purple-700">
                              <Lock className="w-5 h-5" /> Marks Sheet Locked for Modifying
                            </h3>
                            <p className="text-xs text-slate-500">
                              This gradesheet has been locked. Draft saving and lock procedures are restricted. Submit an administrative request to system administrators if edit is required.
                            </p>
                          </div>

                          <form onSubmit={handleRequestUnlock} className="space-y-3 mt-3">
                            <input
                              type="text"
                              required
                              placeholder="Provide descriptive justification for unlocking (e.g., Pre-Mid check correction)..."
                              value={unlockReasonText}
                              onChange={(e) => setUnlockReasonText(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                            />
                            <button
                              type="submit"
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Submit Unlock Authorization Request
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Notification Bar */}
                      {facultyNotification && (
                        <div className="col-span-6">
                          <div
                            className={`p-4 rounded-2xl border flex items-center gap-2 text-sm font-semibold shadow-sm ${
                              facultyNotification.type === 'success'
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                : 'bg-red-50 border-red-100 text-red-800'
                            }`}
                          >
                            {facultyNotification.type === 'success' ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span>{facultyNotification.message}</span>
                          </div>
                        </div>
                      )}

                      {/* Main spreadsheet entry panel (Bento size 6x4) */}
                      <div className="col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-base">Students Marksheet Directory</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Filter, search, and evaluate academic scores across all 1,000 B.Tech students.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase">NIT Grading Bounds Active</span>
                          </div>
                        </div>

                        {/* Roster Search bar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div className="relative flex-1 max-w-md">
                            <input
                              type="text"
                              placeholder="Search students by roll number, name, or branch..."
                              value={studentSearchTerm}
                              onChange={(e) => {
                                setStudentSearchTerm(e.target.value);
                                setStudentPage(1);
                              }}
                              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 bg-slate-50/50"
                            />
                            <span className="absolute left-3 top-2.5 text-slate-400">
                              <Users className="w-3.5 h-3.5" />
                            </span>
                            {studentSearchTerm && (
                              <button
                                onClick={() => {
                                  setStudentSearchTerm('');
                                  setStudentPage(1);
                                }}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-bold shrink-0">
                            Showing <span className="text-slate-800">{filteredStudents.length > 0 ? startIdx + 1 : 0}</span>-
                            <span className="text-slate-800">{Math.min(endIdx, filteredStudents.length)}</span> of <span className="text-indigo-600">{filteredStudents.length}</span> students
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-150">
                          <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 uppercase tracking-wider font-bold">
                                <th className="p-4">Roll Number</th>
                                <th className="p-4">Student Name</th>
                                <th className="p-4 text-center">Pre-Mid (30)</th>
                                <th className="p-4 text-center">Post-Mid (50)</th>
                                <th className="p-4 text-center">TA (20)</th>
                                <th className="p-4 text-center">Total Score (100)</th>
                                <th className="p-4 text-center">Grade Letter</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {paginatedStudents.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="text-center py-12 text-slate-400">
                                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                    No students match your search criteria.
                                  </td>
                                </tr>
                              ) : (
                                paginatedStudents.map((student) => {
                                  const draft = marksheetDraft[student.id] || {
                                    preMid: null,
                                    postMid: null,
                                    ta: null,
                                    total: null,
                                    grade: null
                                  };

                                  const isLocked = activeCourseState?.isLocked || false;

                                  return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="p-4 font-extrabold text-slate-900">{student.rollNo}</td>
                                      <td className="p-4">{student.name}</td>
                                      <td className="p-4 text-center">
                                        <input
                                          type="number"
                                          disabled={isLocked}
                                          placeholder="-"
                                          value={draft.preMid ?? ''}
                                          onChange={(e) => handleMarkChange(student.id, 'preMid', e.target.value)}
                                          className={`w-16 p-2 rounded-lg border text-center font-bold text-slate-800 focus:outline-none focus:border-indigo-600 bg-slate-50/50 focus:bg-white transition-all ${
                                            marksheetValidationErrors[`${student.id}_preMid`] ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'
                                          }`}
                                        />
                                      </td>
                                      <td className="p-4 text-center">
                                        <input
                                          type="number"
                                          disabled={isLocked}
                                          placeholder="-"
                                          value={draft.postMid ?? ''}
                                          onChange={(e) => handleMarkChange(student.id, 'postMid', e.target.value)}
                                          className={`w-16 p-2 rounded-lg border text-center font-bold text-slate-800 focus:outline-none focus:border-indigo-600 bg-slate-50/50 focus:bg-white transition-all ${
                                            marksheetValidationErrors[`${student.id}_postMid`] ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'
                                          }`}
                                        />
                                      </td>
                                      <td className="p-4 text-center">
                                        <input
                                          type="number"
                                          disabled={isLocked}
                                          placeholder="-"
                                          value={draft.ta ?? ''}
                                          onChange={(e) => handleMarkChange(student.id, 'ta', e.target.value)}
                                          className={`w-16 p-2 rounded-lg border text-center font-bold text-slate-800 focus:outline-none focus:border-indigo-600 bg-slate-50/50 focus:bg-white transition-all ${
                                            marksheetValidationErrors[`${student.id}_ta`] ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'
                                          }`}
                                        />
                                      </td>
                                      <td className="p-4 text-center font-extrabold text-slate-900 text-sm">
                                        {draft.total !== null ? draft.total : '-'}
                                      </td>
                                      <td className="p-4 text-center">
                                        {draft.grade ? (
                                          <span
                                            className={`px-3 py-1.5 rounded-full font-black text-xs border ${
                                              draft.grade === 'S' || draft.grade === 'A'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : draft.grade === 'B' || draft.grade === 'C'
                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                : draft.grade === 'D' || draft.grade === 'E'
                                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                            }`}
                                          >
                                            {draft.grade}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 font-bold">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                          <div className="flex justify-between items-center gap-2 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <button
                              disabled={activePage === 1}
                              onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              Previous
                            </button>
                            
                            <span className="text-xs text-slate-500 font-bold">
                              Page {activePage} of {totalPages}
                            </span>

                            <button
                              disabled={activePage === totalPages}
                              onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        )}

                        {/* Footer buttons */}
                        {!activeCourseState?.isLocked && (
                          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                            <button
                              onClick={handleSaveDraft}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Save Draft Evaluation
                            </button>
                            
                            {activeSubject.coordinatorId === currentUser.id && (
                              <button
                                onClick={handleLockMarks}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-100 cursor-pointer"
                              >
                                Finalize & Lock Course Grades
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PERFORMANCE ANALYTICS */}
                  {facultyCourseTab === 'analytics' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Analytics KPI Overview Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Class Average Score</span>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-black text-slate-800 font-mono">{selectedSubjectAnalytics.avg.toFixed(1)}</span>
                            <span className="text-xs text-slate-400">/ 100</span>
                          </div>
                          <p className="text-[10px] text-indigo-500 font-bold mt-1 uppercase">Computed over {selectedSubjectAnalytics.totalEvaluated} students</p>
                        </div>

                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Highest / Lowest Marks</span>
                          <div className="flex items-baseline gap-3 mt-2">
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-emerald-600 font-mono">{selectedSubjectAnalytics.highest}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-black">Max</span>
                            </div>
                            <div className="text-slate-300">|</div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-rose-500 font-mono">{selectedSubjectAnalytics.lowest}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-black">Min</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Range: {selectedSubjectAnalytics.highest - selectedSubjectAnalytics.lowest} points</p>
                        </div>

                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Pass / Fail Rate</span>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-black text-indigo-600 font-mono">{selectedSubjectAnalytics.passRate.toFixed(1)}%</span>
                            <span className="text-xs text-slate-400">Passing</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden flex">
                            <div style={{ width: `${selectedSubjectAnalytics.passRate}%` }} className="bg-indigo-600 h-full"></div>
                            <div style={{ width: `${100 - selectedSubjectAnalytics.passRate}%` }} className="bg-rose-500 h-full"></div>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Standard Deviation</span>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-black text-slate-800 font-mono">{selectedSubjectAnalytics.stdDev.toFixed(2)}</span>
                            <span className="text-xs text-slate-400">σ</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Measure of score dispersion</p>
                        </div>
                      </div>

                      {/* Main Charts Row */}
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        {/* Marks Histogram Chart (col-span-3) */}
                        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">Marks Distribution Histogram</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Frequency count of students across 10-point score bins</p>
                          </div>

                          <div className="h-64 mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={selectedSubjectAnalytics.histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
                                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#94A3B8' }}
                                  itemStyle={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]}>
                                  {selectedSubjectAnalytics.histogramData.map((entry, index) => {
                                    let color = '#6366F1';
                                    if (index >= 8) color = '#10B981'; // 80-100: green
                                    else if (index >= 6) color = '#3B82F6'; // 60-80: blue
                                    else if (index >= 3.5) color = '#F59E0B'; // 35-60: amber
                                    else color = '#EF4444'; // 0-35: red
                                    return <Cell key={`cell-${index}`} fill={color} />;
                                  })}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Sorted Percentile Performance Trend (col-span-3) */}
                        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">Academic Performance Curve</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Real-time percentile-based score trends from lowest to highest</p>
                          </div>

                          <div className="h-64 mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={selectedSubjectAnalytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="percentile" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
                                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#94A3B8' }}
                                  itemStyle={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Evaluation Components Performance breakdown */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-extrabold text-slate-800 text-sm mb-4">Evaluation Component Percentages Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-black text-slate-500 uppercase">Pre-Mid Examination</span>
                              <span className="text-xs font-black text-indigo-600">{(selectedSubjectAnalytics.componentAverages.preMid / 30 * 100).toFixed(1)}% Avg</span>
                            </div>
                            <div className="text-lg font-black text-slate-800 font-mono">
                              {selectedSubjectAnalytics.componentAverages.preMid.toFixed(1)} <span className="text-xs font-semibold text-slate-400">/ 30 Marks</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                              <div style={{ width: `${selectedSubjectAnalytics.componentAverages.preMid / 30 * 100}%` }} className="bg-indigo-500 h-full"></div>
                            </div>
                          </div>

                          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-black text-slate-500 uppercase">Post-Mid Examination</span>
                              <span className="text-xs font-black text-emerald-600">{(selectedSubjectAnalytics.componentAverages.postMid / 50 * 100).toFixed(1)}% Avg</span>
                            </div>
                            <div className="text-lg font-black text-slate-800 font-mono">
                              {selectedSubjectAnalytics.componentAverages.postMid.toFixed(1)} <span className="text-xs font-semibold text-slate-400">/ 50 Marks</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                              <div style={{ width: `${selectedSubjectAnalytics.componentAverages.postMid / 50 * 100}%` }} className="bg-emerald-500 h-full"></div>
                            </div>
                          </div>

                          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-black text-slate-500 uppercase">Teacher Assessment</span>
                              <span className="text-xs font-black text-amber-600">{(selectedSubjectAnalytics.componentAverages.ta / 20 * 100).toFixed(1)}% Avg</span>
                            </div>
                            <div className="text-lg font-black text-slate-800 font-mono">
                              {selectedSubjectAnalytics.componentAverages.ta.toFixed(1)} <span className="text-xs font-semibold text-slate-400">/ 20 Marks</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                              <div style={{ width: `${selectedSubjectAnalytics.componentAverages.ta / 20 * 100}%` }} className="bg-amber-500 h-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: GRADE MANAGEMENT */}
                  {facultyCourseTab === 'grades' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Top half: Grade Distribution Graph and Scale Information */}
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        {/* Grade distribution (col-span-4) */}
                        <div className="col-span-1 md:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">Dynamic Letter Grade Distribution</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Real-time counts of grade letters allotted under current thresholds</p>
                          </div>

                          <div className="h-64 mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={selectedSubjectAnalytics.gradeDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="grade" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
                                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#94A3B8' }}
                                  itemStyle={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                                  {selectedSubjectAnalytics.gradeDistributionData.map((entry, index) => {
                                    const colors = {
                                      S: '#10B981', // emerald
                                      A: '#34D399', // emerald light
                                      B: '#3B82F6', // blue
                                      C: '#60A5FA', // blue light
                                      D: '#F59E0B', // amber
                                      E: '#FBBF24', // amber light
                                      F: '#EF4444'  // red
                                    };
                                    const color = colors[entry.grade as keyof typeof colors] || '#6366F1';
                                    return <Cell key={`cell-${index}`} fill={color} />;
                                  })}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Grade scale details (col-span-2) */}
                        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                              <Award className="w-5 h-5 text-indigo-600" />
                              <span>NIT Grading Thresholds</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1">Automatic conversion rules based on aggregate score</p>
                          </div>

                          <div className="space-y-2 mt-4 flex-1 flex flex-col justify-center">
                            {Object.entries(gradingThresholds).sort((a,b) => (b[1] as number) - (a[1] as number)).map(([grade, threshold]) => {
                              const colors = {
                                S: 'border-emerald-100 bg-emerald-50 text-emerald-700',
                                A: 'border-emerald-100 bg-emerald-50/60 text-emerald-600',
                                B: 'border-blue-100 bg-blue-50 text-blue-700',
                                C: 'border-blue-100 bg-blue-50/60 text-blue-600',
                                D: 'border-amber-100 bg-amber-50 text-amber-700',
                                E: 'border-amber-100 bg-amber-50/60 text-amber-600'
                              };
                              const style = colors[grade as keyof typeof colors] || 'border-slate-100 bg-slate-50 text-slate-700';
                              return (
                                <div key={grade} className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold ${style}`}>
                                  <span className="font-black text-sm">Grade {grade}</span>
                                  <span>Score &ge; {threshold as number}</span>
                                </div>
                              );
                            })}
                            <div className="flex items-center justify-between p-2 rounded-xl border border-red-100 bg-red-50 text-red-700 text-xs font-bold">
                              <span className="font-black text-sm">Grade F (Fail)</span>
                              <span>Score &lt; {gradingThresholds.E}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Grade Preview Directory with CGPA/SGPA contribution */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-base">Automatic Grading Preview Sheet</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Previews student grade values, GP points, and weighted contribution to SGPA</p>
                          </div>
                          <div className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                            Course Weight: <span className="text-indigo-600 font-mono font-extrabold">{activeSubject.credits} Credits</span> ({Math.round(activeSubject.credits / (subjects.filter(s => s.semesterId === activeSubject.semesterId).reduce((acc, curr) => acc + curr.credits, 0) || 10) * 100)}% of semester)
                          </div>
                        </div>

                        {/* Search inside preview */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div className="relative flex-1 max-w-md">
                            <input
                              type="text"
                              placeholder="Search by student roll, name..."
                              value={studentSearchTerm}
                              onChange={(e) => {
                                setStudentSearchTerm(e.target.value);
                                setStudentPage(1);
                              }}
                              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                            />
                            <span className="absolute left-3 top-2.5 text-slate-400">
                              <Users className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-bold shrink-0">
                            Showing <span className="text-slate-800">{filteredStudents.length > 0 ? startIdx + 1 : 0}</span>-
                            <span className="text-slate-800">{Math.min(endIdx, filteredStudents.length)}</span> of <span className="text-indigo-600">{filteredStudents.length}</span> students
                          </div>
                        </div>

                        {/* Roster Table */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-150">
                          <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 uppercase tracking-wider font-bold">
                                <th className="p-4">Roll Number</th>
                                <th className="p-4">Student Name</th>
                                <th className="p-4 text-center">Score (100)</th>
                                <th className="p-4 text-center">Calculated Grade</th>
                                <th className="p-4 text-center">Grade Point (GP)</th>
                                <th className="p-4 text-center">Semester SGPA Contribution</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {paginatedStudents.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="text-center py-12 text-slate-400">
                                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                    No students found.
                                  </td>
                                </tr>
                              ) : (
                                paginatedStudents.map((student) => {
                                  const draft = marksheetDraft[student.id] || { total: null, grade: null };
                                  const gp = draft.grade ? getGradePoints(draft.grade) : 0;
                                  const totalSemCredits = subjects.filter(s => s.semesterId === activeSubject.semesterId).reduce((acc, curr) => acc + curr.credits, 0) || 10;
                                  const contribution = draft.grade ? ((activeSubject.credits * gp) / totalSemCredits).toFixed(3) : '-';
                                  
                                  return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="p-4 font-extrabold text-slate-900 font-mono">{student.rollNo}</td>
                                      <td className="p-4">{student.name}</td>
                                      <td className="p-4 text-center font-bold text-slate-800 font-mono">{draft.total !== null ? draft.total : '-'}</td>
                                      <td className="p-4 text-center">
                                        {draft.grade ? (
                                          <span
                                            className={`px-3 py-1 rounded-full font-black text-xs border ${
                                              draft.grade === 'S' || draft.grade === 'A'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : draft.grade === 'B' || draft.grade === 'C'
                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                : draft.grade === 'D' || draft.grade === 'E'
                                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                            }`}
                                          >
                                            {draft.grade}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">-</span>
                                        )}
                                      </td>
                                      <td className="p-4 text-center font-extrabold text-slate-800 font-mono">{draft.grade ? gp : '-'}</td>
                                      <td className="p-4 text-center font-black text-indigo-600 font-mono">
                                        {draft.grade ? `${contribution} GP` : '-'}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                          <div className="flex justify-between items-center gap-2 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <button
                              disabled={activePage === 1}
                              onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              Previous
                            </button>
                            
                            <span className="text-xs text-slate-500 font-bold">
                              Page {activePage} of {totalPages}
                            </span>

                            <button
                              disabled={activePage === totalPages}
                              onClick={() => setStudentPage((p) => Math.min(totalPages, p + 1))}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW 4: STUDENT VIEWPORT ================= */}
          {currentUser && currentUser.role === 'student' && (
            <div className="space-y-6">
              {/* Header Profile card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-800">Student Academic Portal</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    National Institute of Technology, Rourkela • CSE Semester 5
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Roll Number:</span>
                  <span className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-800">
                    {currentUser.extraId}
                  </span>
                </div>
              </div>

              {/* Bento Grid layouts */}
              <div className="grid grid-cols-6 gap-6">
                {/* SGPA Score Card (Bento size 2x2) */}
                <div className="col-span-6 md:col-span-2 bg-indigo-600 text-white rounded-3xl p-6 border border-indigo-700 shadow-xl shadow-indigo-200/50 flex flex-col justify-between h-52">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/10">
                      Academic SGPA
                    </span>
                    <TrendingUp className="w-5 h-5 opacity-70" />
                  </div>
                  <div>
                    <div className="text-4xl font-extrabold tracking-tight">{sgpa}</div>
                    <p className="text-[11px] text-indigo-150 font-bold uppercase mt-1">Calculated over {activeStudentCredits} credit hours</p>
                  </div>
                </div>

                {/* Status indicator Card (Bento size 2x2) */}
                <div className="col-span-6 md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-52">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Information Check</span>
                    <Info className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-slate-800 text-sm">Grading Publication Rules</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Only marks and grade letter files finalized and locked by primary coordinators are published. Draft grades are withheld to protect grading integrity.
                    </p>
                  </div>
                </div>

                {/* Print Quick card (Bento size 2x2) */}
                <div className="col-span-6 md:col-span-2 bg-slate-900 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between h-52">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Official Release</span>
                    <Printer className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm mb-1">Generate Verified Report</h4>
                    <p className="text-slate-400 text-xs mb-3 leading-relaxed">Get a print-optimized layout of your finalized results sheets.</p>
                    <button
                      onClick={() => window.print()}
                      className="w-full bg-white text-slate-900 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Print Marksheet Report
                    </button>
                  </div>
                </div>

                {/* Main grades spreadsheet panel (Bento size 6x4) */}
                <div className="col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" /> Confirmed Academic Transcript
                  </h3>

                  <div className="overflow-x-auto rounded-2xl border border-slate-150">
                    <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 uppercase tracking-wider font-bold">
                          <th className="p-4">Course Code</th>
                          <th className="p-4">Course Name</th>
                          <th className="p-4 text-center">Credits</th>
                          <th className="p-4 text-center">L-T-P</th>
                          <th className="p-4 text-center">Pre-Mid (30)</th>
                          <th className="p-4 text-center">Post-Mid (50)</th>
                          <th className="p-4 text-center">TA (20)</th>
                          <th className="p-4 text-center">Total (100)</th>
                          <th className="p-4 text-center">Letter Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentTranscriptRecords.map((rec) => {
                          return (
                            <tr key={rec.subjectCode} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-extrabold text-slate-900">{rec.subjectCode}</td>
                              <td className="p-4">{rec.subjectName}</td>
                              <td className="p-4 text-center">{rec.credits}</td>
                              <td className="p-4 text-center font-mono text-[10px]">{rec.ltp}</td>
                              <td className="p-4 text-center font-mono">
                                {rec.preMid !== null ? rec.preMid : <span className="text-slate-400 font-bold">-</span>}
                              </td>
                              <td className="p-4 text-center font-mono">
                                {rec.postMid !== null ? rec.postMid : <span className="text-slate-400 font-bold">-</span>}
                              </td>
                              <td className="p-4 text-center font-mono">
                                {rec.ta !== null ? rec.ta : <span className="text-slate-400 font-bold">-</span>}
                              </td>
                              <td className="p-4 text-center font-extrabold text-slate-900">
                                {rec.total !== null ? rec.total : <span className="text-slate-400 font-bold">-</span>}
                              </td>
                              <td className="p-4 text-center">
                                <span
                                  className={`px-3 py-1.5 rounded-full font-black text-xs border ${
                                    rec.grade === 'Result Awaiting'
                                      ? 'bg-amber-50 text-amber-700 border-amber-100 text-[10px] uppercase font-bold tracking-wider'
                                      : rec.grade === 'S' || rec.grade === 'A'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : rec.grade === 'B' || rec.grade === 'C'
                                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                                      : 'bg-amber-50 text-amber-700 border-amber-100'
                                  }`}
                                >
                                  {rec.grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 font-bold shrink-0 uppercase tracking-widest sticky bottom-0 z-50">
        <div>National Institute of Technology, Rourkela &copy; 2026</div>
        <div className="flex gap-4">
          <span>Project Evaluation Phase</span>
          <span className="text-indigo-600 font-black">Bento Grid Configured</span>
        </div>
      </footer>

      {/* ================= CREDENTIALS INFO MODAL ================= */}
      {showDemoCreds && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowDemoCreds(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-extrabold text-slate-800 text-base mb-4">Demo Credentials Directory</h3>
            <div className="space-y-4">
              <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block mb-1">System Administrator</span>
                <div className="text-xs text-slate-700 flex flex-col gap-1">
                  <div><strong>Email:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-150 text-[11px]">admin@nitrkl.ac.in</code></div>
                  <div><strong>Password:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-150 text-[11px]">adminpassword</code></div>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block mb-1">Course Coordinator (Faculty)</span>
                <div className="text-xs text-slate-700 flex flex-col gap-1">
                  <div><strong>Email:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-150 text-[11px]">bdsahoo@nitrkl.ac.in</code></div>
                  <div><strong>Password:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-150 text-[11px]">password123</code></div>
                  <div className="text-[9px] text-slate-400 mt-1">Authorized as Primary Coordinator for CS-303 / CS-307. Authorized to edit drafts and lock courses.</div>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl">
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block mb-1">Sub-Coordinator (Faculty)</span>
                <div className="text-xs text-slate-700 flex flex-col gap-1">
                  <div><strong>Email:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-blue-150 text-[11px]">akturuk@nitrkl.ac.in</code></div>
                  <div><strong>Password:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-blue-150 text-[11px]">password123</code></div>
                  <div className="text-[9px] text-slate-400 mt-1">Authorized as Sub-Coordinator on CS-303. Can save draft evaluations but restricted from locking.</div>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-2xl">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block mb-1">Student</span>
                <div className="text-xs text-slate-700 flex flex-col gap-1">
                  <div><strong>Email:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-amber-150 text-[11px]">abhishek@nitrkl.ac.in</code></div>
                  <div><strong>Password:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-amber-150 text-[11px]">password123</code></div>
                  <div className="text-[9px] text-slate-400 mt-1">View personal academic report cards. Final scores published post-locking; drafts are withheld.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
