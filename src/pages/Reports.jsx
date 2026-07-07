import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { FileDown, Printer, BarChart3, GraduationCap, BookOpen, Layers } from 'lucide-react';

export default function Reports() {
  const { students, subjects, semesters, marks } = useAcademic();
  const [activeReportTab, setActiveReportTab] = useState('student'); // 'student', 'subject', 'semester'

  // Selection states
  const [selectedStudentRoll, setSelectedStudentRoll] = useState(students[0]?.rollNumber || '');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(subjects[0]?.code || '');
  const [selectedSemesterId, setSelectedSemesterId] = useState(semesters[0]?.id || '');
  const [selectedSectionSubject, setSelectedSectionSubject] = useState(''); // Subject section filter
  const [selectedSectionSemester, setSelectedSectionSemester] = useState(''); // Semester section filter

  // Helper: Convert grade to point
  const gradePoints = { 'Ex': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'P': 5, 'F': 2 };

  const getStudentName = (roll) => students.find(s => s.rollNumber === roll)?.name || 'Unknown';
  const getSubjectName = (code) => subjects.find(s => s.code === code)?.name || 'Unknown';
  const getSemesterName = (id) => semesters.find(s => s.id === id)?.name || 'Unknown';

  // 1. STUDENT-WISE REPORT DATA
  const student = students.find(s => s.rollNumber === selectedStudentRoll);
  const studentMarks = marks.filter(m => m.studentRoll === selectedStudentRoll);

  // SGPA Calculation
  let totalCredits = 0;
  let weightedPoints = 0;
  studentMarks.forEach(m => {
    const sub = subjects.find(s => s.code === m.subjectCode);
    if (sub) {
      const credits = sub.credits;
      const points = gradePoints[m.grade] || 0;
      totalCredits += credits;
      weightedPoints += (credits * points);
    }
  });
  const sgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';

  // 2. SUBJECT-WISE REPORT DATA
  const subjectMarks = marks.filter(m => {
    if (m.subjectCode !== selectedSubjectCode) return false;
    if (selectedSectionSubject === '') return true;
    const s = students.find(stud => stud.rollNumber === m.studentRoll);
    return s && s.section === selectedSectionSubject;
  });
  const totalSubStudents = subjectMarks.length;
  
  let highestMark = 0;
  let sumMarks = 0;
  let passedCount = 0;
  const gradeDistribution = { 'Ex': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'P': 0, 'F': 0 };

  subjectMarks.forEach(m => {
    sumMarks += m.total;
    if (m.total > highestMark) highestMark = m.total;
    if (m.total >= 35) passedCount++;
    if (m.grade in gradeDistribution) {
      gradeDistribution[m.grade]++;
    }
  });

  const averageMark = totalSubStudents > 0 ? (sumMarks / totalSubStudents).toFixed(1) : '0.0';
  const passPercentage = totalSubStudents > 0 ? ((passedCount / totalSubStudents) * 100).toFixed(1) : '0.0';

  // 3. SEMESTER-WISE REPORT DATA
  const semStudents = students.filter(s => {
    if (s.semesterId !== selectedSemesterId) return false;
    if (selectedSectionSemester === '') return true;
    return s.section === selectedSectionSemester;
  });
  const semSubjects = subjects.filter(s => s.semesterId === selectedSemesterId);
  
  // Calculate average for each student in the semester
  const semReportRows = semStudents.map(stud => {
    const studMarks = marks.filter(m => m.studentRoll === stud.rollNumber && semSubjects.some(sub => sub.code === m.subjectCode));
    const total = studMarks.reduce((sum, curr) => sum + curr.total, 0);
    const avg = studMarks.length > 0 ? (total / studMarks.length).toFixed(1) : 'N/A';
    return {
      roll: stud.rollNumber,
      name: stud.name,
      branch: stud.branch,
      subjectsCount: studMarks.length,
      average: avg
    };
  });

  // Export functions
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeReportTab === 'student' && student) {
      csvContent += `Student Report Card for ${student.name} (${student.rollNumber})\n`;
      csvContent += `Branch,${student.branch},Semester,${getSemesterName(student.semesterId)}\n\n`;
      csvContent += "Subject Code,Subject Title,Pre-Mid,Post-Mid,Total,Grade\n";
      studentMarks.forEach(m => {
        csvContent += `"${m.subjectCode}","${getSubjectName(m.subjectCode)}",${m.preMid},${m.postMid},${m.total},"${m.grade}"\n`;
      });
      csvContent += `\nSGPA,${sgpa}\n`;
    } 
    else if (activeReportTab === 'subject') {
      csvContent += `Subject-wise Report Card for ${getSubjectName(selectedSubjectCode)} (${selectedSubjectCode})\n\n`;
      csvContent += `Total Students evaluated,${totalSubStudents}\n`;
      csvContent += `Highest Mark,${highestMark},Average Mark,${averageMark},Pass Percentage,${passPercentage}%\n\n`;
      csvContent += "Student Roll,Pre-Mid,Post-Mid,Total,Grade\n";
      subjectMarks.forEach(m => {
        csvContent += `"${m.studentRoll}",${m.preMid},${m.postMid},${m.total},"${m.grade}"\n`;
      });
    } 
    else if (activeReportTab === 'semester') {
      csvContent += `Semester Report Overview - ${getSemesterName(selectedSemesterId)}\n\n`;
      csvContent += "Roll Number,Student Name,Branch,Evaluated Subjects,Average Marks\n";
      semReportRows.forEach(row => {
        csvContent += `"${row.roll}","${row.name}","${row.branch}",${row.subjectsCount},${row.average}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NITR_Academic_Report_${activeReportTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="no-print">
        <h2 className="section-title" style={{ margin: 0 }}>Performance Reports & Analytics</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            Print Report Card (PDF)
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <FileDown size={16} />
            Export Data (Excel/CSV)
          </button>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="tab-container no-print">
        <button
          className={`tab-btn ${activeReportTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('student')}
        >
          Student-wise Transcript
        </button>
        <button
          className={`tab-btn ${activeReportTab === 'subject' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('subject')}
        >
          Subject-wise Grade Card
        </button>
        <button
          className={`tab-btn ${activeReportTab === 'semester' ? 'active' : ''}`}
          onClick={() => setActiveReportTab('semester')}
        >
          Semester-wise Summary
        </button>
      </div>

      {/* 1. STUDENT-WISE PANEL */}
      {activeReportTab === 'student' && (
        <div>
          {/* Selector */}
          <div className="card no-print" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <GraduationCap size={18} style={{ color: 'var(--primary)' }} />
            <label htmlFor="student-sel" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Select Student:</label>
            <select
              id="student-sel"
              className="form-control"
              value={selectedStudentRoll}
              onChange={(e) => setSelectedStudentRoll(e.target.value)}
              style={{ maxWidth: '300px', margin: 0 }}
            >
              {students.map(s => (
                <option key={s.rollNumber} value={s.rollNumber}>{s.rollNumber} - {s.name}</option>
              ))}
            </select>
          </div>

          {/* Transcript printable card */}
          {student ? (
            <div className="card printable-card" style={{ padding: '2rem' }}>
              {/* Header inside printing */}
              <div className="only-print" style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem' }}>
                <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>NATIONAL INSTITUTE OF TECHNOLOGY ROURKELA</h2>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>ACADEMIC TRANSCRIPT RECORD</h3>
              </div>

              {/* Student Metadata Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                backgroundColor: 'var(--bg-app)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>STUDENT NAME</p>
                  <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{student.name}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ROLL NUMBER</p>
                  <p style={{ fontWeight: 700 }}>{student.rollNumber}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>BRANCH & SECTION</p>
                  <p style={{ fontWeight: 600 }}>{student.branch} - Sec {student.section}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>MAPPED TERM</p>
                  <p style={{ fontWeight: 600 }}>{getSemesterName(student.semesterId)}</p>
                </div>
              </div>

              {/* Marks list */}
              <div className="table-container" style={{ boxShadow: 'none', border: '1px solid var(--border)' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Title</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Credits</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Pre-Mid (30)</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Post-Mid (70)</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Total (100)</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentMarks.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.subjectCode}</td>
                        <td style={{ fontWeight: 600 }}>{getSubjectName(m.subjectCode)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-info">{subjects.find(s => s.code === m.subjectCode)?.credits || 4}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{m.preMid}</td>
                        <td style={{ textAlign: 'center' }}>{m.postMid}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800 }}>{m.total}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-success" style={{ fontWeight: 800 }}>{m.grade}</span>
                        </td>
                      </tr>
                    ))}
                    {studentMarks.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No evaluation scores registered for this student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* GPA summary box */}
              {studentMarks.length > 0 && (
                <div style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <div style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '1rem 2rem',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'right',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Semester SGPA</span>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>{sgpa}</h3>
                    <p style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px' }}>Credit points: {weightedPoints} / Credits: {totalCredits}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No student selected.</p>
          )}
        </div>
      )}

      {/* 2. SUBJECT-WISE PANEL */}
      {activeReportTab === 'subject' && (
        <div>
          {/* Selector */}
          <div className="card no-print" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <BookOpen size={18} style={{ color: 'var(--primary)' }} />
              <label htmlFor="subj-sel" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Select Subject:</label>
              <select
                id="subj-sel"
                className="form-control"
                value={selectedSubjectCode}
                onChange={(e) => setSelectedSubjectCode(e.target.value)}
                style={{ maxWidth: '300px', margin: 0 }}
              >
                {subjects.map(sub => (
                  <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="subj-sec-sel" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Section:</label>
              <select
                id="subj-sec-sel"
                className="form-control"
                value={selectedSectionSubject}
                onChange={(e) => setSelectedSectionSubject(e.target.value)}
                style={{ width: '150px', margin: 0 }}
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }} className="report-dashboard-sections">
            {/* Stats Cards Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid var(--primary)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVERAGE MARKS</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{averageMark} / 100</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Class mean score</span>
              </div>
              <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid var(--accent)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>HIGHEST SCORE</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>{highestMark} / 100</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Class maximum score</span>
              </div>
              <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid var(--success)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PASS PERCENTAGE</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>{passPercentage}%</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scores &gt;= 35 marks</span>
              </div>
            </div>

            {/* Dynamic SVG Grade Chart Card */}
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
                Letter Grade Distribution
              </h3>

              {/* Inline SVG Bar Chart */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
                {totalSubStudents === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No grading statistics available.</p>
                ) : (
                  <svg width="100%" height="180" viewBox="0 0 450 180" style={{ overflow: 'visible' }}>
                    {/* Grid Lines */}
                    <line x1="40" y1="140" x2="430" y2="140" stroke="#dcdde1" strokeWidth="1.5" />
                    <line x1="40" y1="90" x2="430" y2="90" stroke="#f1f2f6" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="40" y1="40" x2="430" y2="40" stroke="#f1f2f6" strokeWidth="1" strokeDasharray="4 4" />
                    
                    {/* Render bars for Ex, A, B, C, D, P, F */}
                    {Object.keys(gradeDistribution).map((gr, i) => {
                      const count = gradeDistribution[gr];
                      // Max scale height: 100px. Resolve height scale.
                      const maxCount = Math.max(...Object.values(gradeDistribution), 1);
                      const barHeight = (count / maxCount) * 100;
                      const xPos = 60 + i * 52;
                      const yPos = 140 - barHeight;

                      return (
                        <g key={gr}>
                          {/* Value above bar */}
                          <text x={xPos + 18} y={yPos - 6} fill="var(--text-main)" fontSize="10" fontWeight="bold" textAnchor="middle">{count}</text>
                          
                          {/* Bar */}
                          <rect
                            x={xPos}
                            y={yPos}
                            width="36"
                            height={barHeight}
                            fill={gr === 'F' ? 'var(--error)' : gr === 'Ex' ? 'var(--success)' : 'var(--primary)'}
                            rx="4"
                            style={{ transition: 'all 0.5s' }}
                          />

                          {/* Label on X Axis */}
                          <text x={xPos + 18} y="156" fill="var(--text-muted)" fontSize="11" fontWeight="700" textAnchor="middle">{gr}</text>
                        </g>
                      );
                    })}

                    <text x="15" y="143" fill="var(--text-muted)" fontSize="9" textAnchor="middle">0</text>
                    <text x="15" y="93" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Avg</text>
                    <text x="15" y="43" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Max</text>
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Student list for subject */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1rem' }}>Registered Class Scores</h3>
            <div className="table-container" style={{ boxShadow: 'none', border: '1px solid var(--border)', margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Sl.</th>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Pre-Mid (30)</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Post-Mid (70)</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Total Score</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectMarks.map((m, idx) => (
                    <tr key={m.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.studentRoll}</td>
                      <td style={{ fontWeight: 600 }}>{getStudentName(m.studentRoll)}</td>
                      <td style={{ textAlign: 'center' }}>{m.preMid}</td>
                      <td style={{ textAlign: 'center' }}>{m.postMid}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{m.total}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${m.grade === 'F' ? 'badge-danger' : 'badge-success'}`}>{m.grade}</span>
                      </td>
                    </tr>
                  ))}
                  {subjectMarks.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No marks logged for this course.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SEMESTER-WISE PANEL */}
      {activeReportTab === 'semester' && (
        <div>
          {/* Selector */}
          <div className="card no-print" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <Layers size={18} style={{ color: 'var(--primary)' }} />
              <label htmlFor="sem-sel" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Select Semester Term:</label>
              <select
                id="sem-sel"
                className="form-control"
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                style={{ maxWidth: '300px', margin: 0 }}
              >
                {semesters.map(sem => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="sem-sec-sel" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Section:</label>
              <select
                id="sem-sec-sel"
                className="form-control"
                value={selectedSectionSemester}
                onChange={(e) => setSelectedSectionSemester(e.target.value)}
                style={{ width: '150px', margin: 0 }}
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1rem' }}>
              Semester Performance Ledger: {getSemesterName(selectedSemesterId)}
            </h3>

            <div className="table-container" style={{ boxShadow: 'none', border: '1px solid var(--border)', margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Sl. No.</th>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Branch</th>
                    <th style={{ width: '180px', textAlign: 'center' }}>Evaluated Courses</th>
                    <th style={{ width: '180px', textAlign: 'center' }}>Average Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {semReportRows.map((row, idx) => (
                    <tr key={row.roll}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{row.roll}</td>
                      <td style={{ fontWeight: 600 }}>{row.name}</td>
                      <td>
                        <span className="badge badge-info">{row.branch}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.subjectsCount} Subjects</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: row.average === 'N/A' ? 'var(--text-muted)' : 'var(--primary)' }}>
                        {row.average}
                      </td>
                    </tr>
                  ))}
                  {semReportRows.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No students enrolled in this semester term.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
