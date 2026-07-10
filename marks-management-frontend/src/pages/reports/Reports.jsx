import React, { useState, useEffect } from 'react';
import { FileText, GraduationCap, Award, Search, Download } from 'lucide-react';
import { getSemesters, getSubjectsForSemester } from '../../api/semesterApi';
import { getStudents } from '../../api/studentApi';
import { getGradeColor } from '../../utils/grading';
import axiosClient from '../../api/axiosClient';
import '../../styles/pages/AdminPage.css';
import '../../styles/pages/Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [semesterSubjects, setSemesterSubjects] = useState([]);
  
  // Student report state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [studentReport, setStudentReport] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  
  // Subject distribution state
  const [selectedSubSemester, setSelectedSubSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [distribution, setDistribution] = useState(null);
  const [distLoading, setDistLoading] = useState(false);
  
  const [error, setError] = useState('');

  useEffect(() => {
    getSemesters().then(r => setSemesters(r.data)).catch(() => {});
    getStudents().then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const handleSubSemesterChange = async (semId) => {
    setSelectedSubSemester(semId);
    setSelectedSubject('');
    setDistribution(null);
    if (!semId) return;
    try {
      const res = await getSubjectsForSemester(semId);
      setSemesterSubjects(res.data);
    } catch {
      setSemesterSubjects([]);
    }
  };

  const handleFetchStudentReport = async () => {
    if (!selectedStudent || !selectedSemester) return;
    setStudentLoading(true);
    setError('');
    setStudentReport(null);
    try {
      const res = await axiosClient.get(`/api/reports/student/${selectedStudent}/semester/${selectedSemester}`);
      setStudentReport(res.data);
    } catch (err) {
      setError('No marksheet records found for this student and semester.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleFetchDistribution = async (subjectId) => {
    setSelectedSubject(subjectId);
    if (!subjectId) return;
    setDistLoading(true);
    setError('');
    try {
      const res = await axiosClient.get(`/api/reports/distribution/${subjectId}`);
      setDistribution(res.data);
    } catch (err) {
      setError('Failed to fetch grade distribution.');
    } finally {
      setDistLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-desc">Generate official student marksheets and subject grade distribution reports</p>
        </div>
      </div>

      <div className="tab-buttons glass-card">
        <button className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`} onClick={() => { setActiveTab('student'); setError(''); }}>
          <GraduationCap size={18} /> Student Consolidated Marksheet
        </button>
        <button className={`tab-btn ${activeTab === 'subject' ? 'active' : ''}`} onClick={() => { setActiveTab('subject'); setError(''); }}>
          <Award size={18} /> Subject Grade Distribution
        </button>
      </div>

      {error && <div className="form-error" style={{ marginTop: '10px' }}>{error}</div>}

      {activeTab === 'student' ? (
        <div className="report-content-wrapper">
          <div className="report-filters glass-card">
            <div className="marks-filter-group">
              <label className="form-label">Student</label>
              <select className="form-input" value={selectedStudent} onChange={e => { setSelectedStudent(e.target.value); setStudentReport(null); }}>
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                ))}
              </select>
            </div>
            <div className="marks-filter-group">
              <label className="form-label">Semester</label>
              <select className="form-input" value={selectedSemester} onChange={e => { setSelectedSemester(e.target.value); setStudentReport(null); }}>
                <option value="">Select semester...</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>Semester {s.number}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary filter-submit-btn" disabled={!selectedStudent || !selectedSemester || studentLoading} onClick={handleFetchStudentReport}>
              <Search size={16} /> Fetch Marksheet
            </button>
          </div>

          {studentLoading && <div className="loading-state"><div className="loader-spinner"></div><p>Generating marksheet...</p></div>}

          {studentReport && (
            <div className="marksheet-print-card glass-card">
              <div className="marksheet-header">
                <div className="rkl-shield">NIT ROURKELA</div>
                <div className="marksheet-title-area">
                  <h2>National Institute of Technology Rourkela</h2>
                  <h3>Official Semester Grade Card</h3>
                </div>
              </div>

              <div className="student-meta-info">
                <div>
                  <div className="meta-row"><strong>Name:</strong> {studentReport.studentName}</div>
                  <div className="meta-row"><strong>Roll Number:</strong> <code className="code-tag">{studentReport.rollNumber}</code></div>
                </div>
                <div>
                  <div className="meta-row"><strong>Department:</strong> {studentReport.department || 'Computer Science'}</div>
                  <div className="meta-row"><strong>Semester:</strong> Semester {studentReport.semesterNumber}</div>
                </div>
              </div>

              <div className="table-wrapper" style={{ margin: '20px 0', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Credits</th>
                      <th>Pre-Mid</th>
                      <th>Post-Mid</th>
                      <th>Total</th>
                      <th>Grade Letter</th>
                      <th>GP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentReport.details?.map((d, i) => (
                      <tr key={i}>
                        <td><code className="code-tag">{d.subjectCode}</code></td>
                        <td className="cell-primary">{d.subjectName}</td>
                        <td>{d.credits}</td>
                        <td>{d.preMidMarks ?? '—'}</td>
                        <td>{d.postMidMarks ?? '—'}</td>
                        <td>{d.totalMarks ?? '—'}</td>
                        <td>
                          <span className="marks-grade-badge" style={{
                            background: `${getGradeColor(d.grade)}15`,
                            color: getGradeColor(d.grade),
                            borderColor: `${getGradeColor(d.grade)}33`,
                            padding: '3px 10px',
                            fontWeight: '700',
                            borderRadius: '4px'
                          }}>
                            {d.grade}
                          </span>
                        </td>
                        <td className="cell-primary">{d.gradePoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="marksheet-footer">
                <div className="sgpa-badge">
                  Semester SGPA: <span>{studentReport.sgpa?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="report-content-wrapper">
          <div className="report-filters glass-card">
            <div className="marks-filter-group">
              <label className="form-label">Semester</label>
              <select className="form-input" value={selectedSubSemester} onChange={e => handleSubSemesterChange(e.target.value)}>
                <option value="">Select semester...</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>Semester {s.number}</option>
                ))}
              </select>
            </div>
            <div className="marks-filter-group">
              <label className="form-label">Subject</label>
              <select className="form-input" disabled={!selectedSubSemester} value={selectedSubject} onChange={e => handleFetchDistribution(e.target.value)}>
                <option value="">Select subject...</option>
                {semesterSubjects.map(ss => (
                  <option key={ss.id} value={ss.id}>{ss.subject?.code} — {ss.subject?.name}</option>
                ))}
              </select>
            </div>
          </div>

          {distLoading && <div className="loading-state"><div className="loader-spinner"></div><p>Fetching distribution analytics...</p></div>}

          {distribution && (
            <div className="distribution-report-card glass-card">
              <div className="dist-header" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Grade Distribution Analytics
              </div>
              <div className="dist-analytics-body">
                <div className="dist-bars-vertical">
                  {Object.entries(distribution).map(([grade, count]) => {
                    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
                    const percent = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={grade} className="v-bar-item">
                        <div className="v-bar-count">{count}</div>
                        <div className="v-bar-track">
                          <div className="v-bar-fill" style={{
                            height: `${percent}%`,
                            background: getGradeColor(grade)
                          }}></div>
                        </div>
                        <div className="v-bar-label" style={{ color: getGradeColor(grade) }}>{grade}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="dist-stats-side">
                  <h3>Statistics</h3>
                  <div className="stats-row">
                    <span>Total Graded:</span>
                    <strong>{Object.values(distribution).reduce((a, b) => a + b, 0)} Students</strong>
                  </div>
                  <div className="stats-row">
                    <span>Passing Students (O-D):</span>
                    <strong>{Object.entries(distribution).filter(([g]) => g !== 'F').reduce((a, b) => a + b[1], 0)}</strong>
                  </div>
                  <div className="stats-row">
                    <span>Failures (F):</span>
                    <strong style={{ color: 'var(--grade-f)' }}>{distribution.F || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
