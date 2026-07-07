import React, { useState, useEffect } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { useAuth } from '../context/AuthContext';
import { Save, AlertTriangle, CheckCircle2, BookOpen, Layers } from 'lucide-react';

export default function MarksEntry() {
  const { user } = useAuth();
  const { subjects, semesters, students, marks, saveMarks } = useAcademic();

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSection, setSelectedSection] = useState('A'); // Section state
  const [activeSubTab, setActiveSubTab] = useState('preMid'); // 'preMid' or 'postMid'
  const [marksList, setMarksList] = useState([]); // Array of { studentRoll, name, preMid, postMid, error: '' }
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // 1. Filter subjects mapped to this faculty member
  const facultySubjects = subjects.filter(sub => {
    if (!user) return false;
    if (user.role === 'Admin') return true; // Admins can select any subject
    return sub.coordinatorId === user.id || (sub.subCoordinators && sub.subCoordinators.includes(user.id));
  });

  // Active Subject Detail
  const activeSubject = subjects.find(s => s.id === selectedSubjectId);

  // Set default subject on load
  useEffect(() => {
    if (facultySubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(facultySubjects[0].id);
    }
  }, [facultySubjects, selectedSubjectId]);

  // 2. Load students and their existing marks whenever active subject or section changes
  useEffect(() => {
    if (!activeSubject) {
      setMarksList([]);
      return;
    }

    // Filter students mapped to the subject's semester and selected section
    const targetStudents = students.filter(
      s => s.semesterId === activeSubject.semesterId && s.section === selectedSection
    );

    // Build the grid list merging with existing marks
    const gridData = targetStudents.map(student => {
      const existingMark = marks.find(m => m.studentRoll === student.rollNumber && m.subjectCode === activeSubject.code);
      return {
        studentRoll: student.rollNumber,
        name: student.name,
        preMid: existingMark ? existingMark.preMid : '',
        postMid: existingMark ? existingMark.postMid : '',
        error: ''
      };
    });

    setMarksList(gridData);
    setError('');
  }, [selectedSubjectId, activeSubject, selectedSection, students, marks]);

  const getSemesterName = (semId) => {
    const sem = semesters.find(s => s.id === semId);
    return sem ? sem.name : 'Unknown Semester';
  };

  const handleMarksChange = (roll, field, val) => {
    setSuccess('');
    setError('');
    const updated = marksList.map(item => {
      if (item.studentRoll === roll) {
        const numVal = val === '' ? '' : Number(val);
        const nextItem = { ...item, [field]: numVal };

        // Real-time validations
        if (val !== '' && (isNaN(numVal) || numVal < 0)) {
          nextItem.error = 'Marks must be positive numbers.';
        } else if (field === 'preMid' && numVal > 30) {
          nextItem.error = 'Pre Mid-Sem marks cannot exceed 30.';
        } else if (field === 'postMid' && numVal > 70) {
          nextItem.error = 'Post Mid-Sem marks cannot exceed 70.';
        } else {
          nextItem.error = '';
        }

        return nextItem;
      }
      return item;
    });

    setMarksList(updated);
  };

  const handleSave = async () => {
    // Validate all records before posting
    const hasErrors = marksList.some(item => item.error !== '');
    if (hasErrors) {
      setError('Please resolve all validation errors in the sheet before saving.');
      return;
    }

    try {
      setError('');
      await saveMarks(activeSubject.code, marksList);
      setSuccess(`Evaluation marks for ${activeSubject.code} updated successfully.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Error occurred while saving marks.');
    }
  };

  return (
    <div>
      <h2 className="section-title">Evaluation Marks Entry</h2>

      {facultySubjects.length === 0 ? (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>You do not have any active course assignments. Please contact the System Administrator.</span>
        </div>
      ) : (
        <>
          {/* Controls Panel */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1', minWidth: '220px' }}>
              <BookOpen size={18} style={{ color: 'var(--primary)' }} />
              <label htmlFor="select-sub" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Select Subject:</label>
              <select
                id="select-sub"
                className="form-control"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              >
                {facultySubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '160px' }}>
              <label htmlFor="select-sec" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Section:</label>
              <select
                id="select-sec"
                className="form-control"
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSuccess('');
                  setError('');
                }}
                style={{ width: '110px', margin: 0 }}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            {activeSubject && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <Layers size={16} />
                <span>Mapped Semester: <strong>{getSemesterName(activeSubject.semesterId)}</strong></span>
                <span style={{ margin: '0 0.5rem' }}>|</span>
                <span>Credits: <strong style={{ color: 'var(--primary)' }}>{activeSubject.credits}</strong></span>
              </div>
            )}
          </div>

          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {activeSubject && (
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              {/* Tabs for Pre and Post Mid Sem */}
              <div className="tab-container">
                <button
                  className={`tab-btn ${activeSubTab === 'preMid' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('preMid')}
                >
                  Pre Mid-Semester (Max 30)
                </button>
                <button
                  className={`tab-btn ${activeSubTab === 'postMid' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('postMid')}
                >
                  Post Mid-Semester (Max 70)
                </button>
              </div>

              {/* Marks Sheet Table */}
              <div className="table-container" style={{ border: '1px solid var(--border)', boxShadow: 'none' }}>
                <table className="custom-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Sl. No.</th>
                      <th style={{ width: '150px' }}>Roll Number</th>
                      <th>Student Name</th>
                      <th style={{ width: '220px' }}>
                        {activeSubTab === 'preMid' ? 'Pre-Mid Sem Marks (30)' : 'Post-Mid Sem Marks (70)'}
                      </th>
                      <th>Status / Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksList.map((item, idx) => (
                      <tr key={item.studentRoll}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.studentRoll}</td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={activeSubTab === 'preMid' ? 'Max 30' : 'Max 70'}
                            value={activeSubTab === 'preMid' ? item.preMid : item.postMid}
                            onChange={(e) => handleMarksChange(item.studentRoll, activeSubTab, e.target.value)}
                            style={{
                              width: '120px',
                              borderColor: item.error ? 'var(--error)' : 'var(--border)',
                              backgroundColor: item.error ? '#fcf1f1' : '#ffffff',
                              fontWeight: 700,
                              textAlign: 'center'
                            }}
                            min="0"
                            max={activeSubTab === 'preMid' ? 30 : 70}
                          />
                        </td>
                        <td>
                          {item.error ? (
                            <span style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={14} />
                              {item.error}
                            </span>
                          ) : (
                            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Valid Entry</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {marksList.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No students registered in this semester.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {marksList.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={16} />
                    Save & Submit Marks
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
