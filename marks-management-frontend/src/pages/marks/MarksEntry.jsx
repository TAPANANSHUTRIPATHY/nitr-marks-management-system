import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Lock, Send, ChevronDown, AlertCircle } from 'lucide-react';
import { getSemesters } from '../../api/semesterApi';
import { getSubjectsForSemester } from '../../api/semesterApi';
import { getMarks, batchSaveMarks, submitMarks, lockMarks } from '../../api/marksApi';
import { calculateGrade, getGradeColor } from '../../utils/grading';
import '../../styles/pages/MarksEntry.css';
import '../../styles/pages/AdminPage.css';

const GradeBadge = ({ grade }) => {
  if (!grade || grade === '-') return <span className="grade-badge-empty">—</span>;
  return (
    <span className="marks-grade-badge" style={{
      background: `${getGradeColor(grade)}22`,
      color: getGradeColor(grade),
      borderColor: `${getGradeColor(grade)}44`,
    }}>
      {grade}
    </span>
  );
};

const MarksEntry = () => {
  const [semesters, setSemesters] = useState([]);
  const [semesterSubjects, setSemesterSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [localMarks, setLocalMarks] = useState({});
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSemSubject, setSelectedSemSubject] = useState(null);
  const [status, setStatus] = useState('DRAFT');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef({});

  useEffect(() => {
    getSemesters().then(r => setSemesters(r.data)).catch(() => {});
  }, []);

  const loadSubjects = async (semId) => {
    setSelectedSemester(semId);
    setSelectedSemSubject(null);
    setStudents([]);
    setLocalMarks({});
    if (!semId) return;
    try {
      const res = await getSubjectsForSemester(semId);
      setSemesterSubjects(res.data);
    } catch {
      setSemesterSubjects([]);
    }
  };

  const loadMarksForSubject = async (semSub) => {
    if (!semSub) return;
    setSelectedSemSubject(semSub);
    setLoading(true);
    setError('');
    try {
      const marksRes = await getMarks(semSub.id);
      const rows = marksRes.data || [];

      setStudents(rows.map(m => ({
        id: m.studentId,
        rollNumber: m.rollNumber,
        name: m.studentName,
        department: m.department,
      })));

      const mMap = {};
      rows.forEach(m => {
        mMap[m.studentId] = m;
      });
      setMarksMap(mMap);

      const initLocal = {};
      rows.forEach(m => {
        initLocal[m.studentId] = {
          preMid: m.preMidMarks ?? '',
          postMid: m.postMidMarks ?? '',
        };
      });
      setLocalMarks(initLocal);

      const statuses = rows.map(m => m.status);
      if (statuses.some(st => st === 'LOCKED')) setStatus('LOCKED');
      else if (statuses.some(st => st === 'SUBMITTED')) setStatus('SUBMITTED');
      else setStatus('DRAFT');
    } catch (err) {
      setStudents([]);
      setError(err.response?.data?.message || 'Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, field, value) => {
    if (status === 'LOCKED') return;
    setLocalMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleKeyDown = (e, studentId, field) => {
    const rows = students.map(s => s.id);
    const currentRow = rows.indexOf(studentId);
    const fields = ['preMid', 'postMid'];
    const currentField = fields.indexOf(field);

    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentField < fields.length - 1) {
        inputRefs.current[`${studentId}-${fields[currentField + 1]}`]?.focus();
      } else if (currentRow < rows.length - 1) {
        inputRefs.current[`${rows[currentRow + 1]}-preMid`]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentField > 0) {
        inputRefs.current[`${studentId}-${fields[currentField - 1]}`]?.focus();
      }
    } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      if (currentRow < rows.length - 1) {
        inputRefs.current[`${rows[currentRow + 1]}-${field}`]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentRow > 0) {
        inputRefs.current[`${rows[currentRow - 1]}-${field}`]?.focus();
      }
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleSave = async () => {
    if (!selectedSemSubject) return;
    setSaving(true);
    setError('');
    try {
      const marksArray = students.map(s => ({
        studentId: s.id,
        preMidMarks: localMarks[s.id]?.preMid !== '' && localMarks[s.id]?.preMid !== undefined
          ? parseFloat(localMarks[s.id].preMid) : null,
        postMidMarks: localMarks[s.id]?.postMid !== '' && localMarks[s.id]?.postMid !== undefined
          ? parseFloat(localMarks[s.id].postMid) : null,
      }));
      await batchSaveMarks(selectedSemSubject.id, marksArray);
      showSuccess('Marks saved successfully as Draft.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit marks for review? After submission, only the Course Coordinator can edit.')) return;
    try {
      await submitMarks(selectedSemSubject.id);
      setStatus('SUBMITTED');
      showSuccess('Marks submitted for review.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit marks');
    }
  };

  const handleLock = async () => {
    if (!window.confirm('LOCK marks permanently? This action cannot be undone.')) return;
    try {
      await lockMarks(selectedSemSubject.id);
      setStatus('LOCKED');
      showSuccess('Marks locked permanently.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock marks');
    }
  };

  const getGradeStats = () => {
    const counts = { O: 0, E: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    students.forEach(s => {
      const lm = localMarks[s.id];
      if (!selectedSemSubject) return;
      const result = calculateGrade(lm?.preMid, lm?.postMid, selectedSemSubject.subject?.maxMarksPreMid, selectedSemSubject.subject?.maxMarksPostMid);
      if (result.grade && result.grade !== '-') counts[result.grade] = (counts[result.grade] || 0) + 1;
    });
    return counts;
  };

  const gradeStats = selectedSemSubject ? getGradeStats() : null;
  const totalStudents = students.length;

  return (
    <div className="marks-entry-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Marks Entry</h1>
          <p className="page-desc">Enter pre-mid and post-mid semester marks. Grades are computed automatically.</p>
        </div>
        {selectedSemSubject && status !== 'LOCKED' && (
          <div className="marks-action-btns">
            <button className="btn btn-ghost" onClick={handleSave} disabled={saving}>
              {saving ? <span className="btn-spinner-dark"></span> : <Save size={17} />}
              Save Draft
            </button>
            {status === 'DRAFT' && (
              <button className="btn btn-submit" onClick={handleSubmit}>
                <Send size={17} /> Submit
              </button>
            )}
            {status === 'SUBMITTED' && (
              <button className="btn btn-lock" onClick={handleLock}>
                <Lock size={17} /> Lock Marks
              </button>
            )}
          </div>
        )}
      </div>

      {successMsg && <div className="success-toast">{successMsg}</div>}
      {error && <div className="form-error">{error}</div>}

      <div className="marks-filters glass-card">
        <div className="marks-filter-group">
          <label className="form-label">Semester</label>
          <select className="form-input" value={selectedSemester} onChange={e => loadSubjects(e.target.value)}>
            <option value="">Select semester...</option>
            {semesters.map(s => (
              <option key={s.id} value={s.id}>Semester {s.number} ({s.type})</option>
            ))}
          </select>
        </div>
        <div className="marks-filter-group">
          <label className="form-label">Subject</label>
          <select className="form-input" disabled={!selectedSemester}
            value={selectedSemSubject?.id || ''}
            onChange={e => {
              const ss = semesterSubjects.find(s => s.id === e.target.value);
              loadMarksForSubject(ss);
            }}>
            <option value="">Select subject...</option>
            {semesterSubjects.map(ss => (
              <option key={ss.id} value={ss.id}>
                {ss.subject?.code} — {ss.subject?.name}
              </option>
            ))}
          </select>
        </div>
        {selectedSemSubject && (
          <div className={`marks-status-badge status-${status.toLowerCase()}`}>
            {status === 'DRAFT' ? '📝 Draft' : status === 'SUBMITTED' ? '📤 Submitted' : '🔒 Locked'}
          </div>
        )}
      </div>

      {selectedSemSubject && gradeStats && totalStudents > 0 && (
        <div className="grade-distribution glass-card">
          <div className="dist-header">Grade Distribution ({totalStudents} students)</div>
          <div className="dist-bars">
            {Object.entries(gradeStats).map(([g, count]) => (
              <div key={g} className="dist-bar-item">
                <div className="dist-bar-label" style={{ color: getGradeColor(g) }}>{g}</div>
                <div className="dist-bar-track">
                  <div className="dist-bar-fill" style={{
                    width: totalStudents > 0 ? `${(count / totalStudents) * 100}%` : '0%',
                    background: getGradeColor(g)
                  }}></div>
                </div>
                <div className="dist-bar-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state"><div className="loader-spinner"></div><p>Loading marks...</p></div>
      ) : selectedSemSubject && students.length > 0 ? (
        <div className="marks-grid-wrapper glass-card">
          <div className="marks-grid-scroll">
            <table className="marks-grid-table">
              <thead>
                <tr>
                  <th className="col-roll sticky-col">Roll No.</th>
                  <th className="col-name">Student Name</th>
                  <th className="col-marks">
                    Pre-Mid
                    <span className="max-marks-hint">/ {selectedSemSubject.subject?.maxMarksPreMid || 30}</span>
                  </th>
                  <th className="col-marks">
                    Post-Mid
                    <span className="max-marks-hint">/ {selectedSemSubject.subject?.maxMarksPostMid || 70}</span>
                  </th>
                  <th className="col-total">Total</th>
                  <th className="col-pct">%</th>
                  <th className="col-grade">Grade</th>
                  <th className="col-gp">GP</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const lm = localMarks[student.id] || {};
                  const result = calculateGrade(
                    lm.preMid, lm.postMid,
                    selectedSemSubject.subject?.maxMarksPreMid,
                    selectedSemSubject.subject?.maxMarksPostMid
                  );
                  return (
                    <tr key={student.id} className={idx % 2 === 0 ? '' : 'row-alt'}>
                      <td className="col-roll sticky-col">
                        <code className="code-tag">{student.rollNumber}</code>
                      </td>
                      <td className="col-name cell-primary">{student.name}</td>
                      <td className="col-marks">
                        <input
                          ref={el => inputRefs.current[`${student.id}-preMid`] = el}
                          className="marks-input"
                          type="number"
                          min="0"
                          max={selectedSemSubject.subject?.maxMarksPreMid || 30}
                          step="0.5"
                          value={lm.preMid}
                          onChange={e => handleMarksChange(student.id, 'preMid', e.target.value)}
                          onKeyDown={e => handleKeyDown(e, student.id, 'preMid')}
                          disabled={status === 'LOCKED'}
                          placeholder="—"
                        />
                      </td>
                      <td className="col-marks">
                        <input
                          ref={el => inputRefs.current[`${student.id}-postMid`] = el}
                          className="marks-input"
                          type="number"
                          min="0"
                          max={selectedSemSubject.subject?.maxMarksPostMid || 70}
                          step="0.5"
                          value={lm.postMid}
                          onChange={e => handleMarksChange(student.id, 'postMid', e.target.value)}
                          onKeyDown={e => handleKeyDown(e, student.id, 'postMid')}
                          disabled={status === 'LOCKED'}
                          placeholder="—"
                        />
                      </td>
                      <td className="col-total">{result.total}</td>
                      <td className="col-pct">{result.percentage !== '-' ? `${result.percentage}%` : '—'}</td>
                      <td className="col-grade">
                        <GradeBadge grade={result.grade} />
                      </td>
                      <td className="col-gp">{result.gradePoint !== '-' ? result.gradePoint : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedSemSubject ? (
        <div className="empty-state glass-card">
          <AlertCircle size={48} />
          <h3>No Students Found</h3>
          <p>No students are enrolled in this session and semester. Add students with matching session and semester number first.</p>
        </div>
      ) : (
        <div className="marks-placeholder glass-card">
          <div className="placeholder-icon">📊</div>
          <h3>Select a Semester and Subject</h3>
          <p>Use the filters above to load the marks entry grid.</p>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;
