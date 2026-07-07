import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { useAuth } from '../context/AuthContext';
import { Search, Edit2, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function MarksManagement() {
  const { user } = useAuth();
  const { students, subjects, semesters, marks, saveMarks } = useAcademic();

  const [searchRoll, setSearchRoll] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSection, setFilterSection] = useState(''); // Section filter state
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Editing state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState({ studentRoll: '', name: '', subjectCode: '', preMid: 0, postMid: 0, error: '' });

  // Resolve Semester Name from Subject
  const getSubjectSemesterName = (subjectCode) => {
    const sub = subjects.find(s => s.code === subjectCode);
    if (!sub) return 'Unknown';
    const sem = semesters.find(s => s.id === sub.semesterId);
    return sem ? sem.name : 'Unknown';
  };

  const getStudentName = (roll) => {
    const student = students.find(s => s.rollNumber === roll);
    return student ? student.name : 'Unknown Student';
  };

  // Check if current user is allowed to edit a specific subject code
  const canEditRecord = (subjectCode) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    const sub = subjects.find(s => s.code === subjectCode);
    if (!sub) return false;
    return sub.coordinatorId === user.id || (sub.subCoordinators && sub.subCoordinators.includes(user.id));
  };

  // Filter marks list based on search filters
  const filteredMarks = marks.filter(mark => {
    const student = students.find(s => s.rollNumber === mark.studentRoll);
    
    // Search query matches roll number
    const matchesRoll = mark.studentRoll.toLowerCase().includes(searchRoll.toLowerCase());
    
    // Filter subject matches
    const matchesSubject = filterSubject === '' || mark.subjectCode === filterSubject;
    
    // Filter semester matches (resolve semester of the subject)
    const sub = subjects.find(s => s.code === mark.subjectCode);
    const matchesSemester = filterSemester === '' || (sub && sub.semesterId === filterSemester);

    // Filter section matches
    const matchesSection = filterSection === '' || (student && student.section === filterSection);

    return matchesRoll && matchesSubject && matchesSemester && matchesSection;
  });

  const handleOpenEdit = (mark) => {
    setEditRecord({
      studentRoll: mark.studentRoll,
      name: getStudentName(mark.studentRoll),
      subjectCode: mark.subjectCode,
      preMid: mark.preMid,
      postMid: mark.postMid,
      error: ''
    });
    setError('');
    setEditModalOpen(true);
  };

  const handleEditChange = (field, val) => {
    const numVal = val === '' ? '' : Number(val);
    const nextRecord = { ...editRecord, [field]: numVal };

    if (val !== '' && (isNaN(numVal) || numVal < 0)) {
      nextRecord.error = 'Marks must be positive numbers.';
    } else if (field === 'preMid' && numVal > 30) {
      nextRecord.error = 'Pre Mid-Sem marks cannot exceed 30.';
    } else if (field === 'postMid' && numVal > 70) {
      nextRecord.error = 'Post Mid-Sem marks cannot exceed 70.';
    } else {
      nextRecord.error = '';
    }

    setEditRecord(nextRecord);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editRecord.error) {
      setError('Please fix validation errors first.');
      return;
    }

    try {
      setError('');
      // Wrap single update into array for saveMarks API
      const updatePayload = [{
        studentRoll: editRecord.studentRoll,
        preMid: editRecord.preMid,
        postMid: editRecord.postMid
      }];

      await saveMarks(editRecord.subjectCode, updatePayload);
      setSuccess(`Marks for student ${editRecord.studentRoll} in ${editRecord.subjectCode} updated.`);
      setEditModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error updating marks record.');
    }
  };

  return (
    <div>
      <h2 className="section-title">Academic Marks Register</h2>

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

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search student roll number..."
            value={searchRoll}
            onChange={(e) => setSearchRoll(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px', margin: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{ margin: 0 }}
          >
            <option value="">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.code}>{sub.code} - {sub.name}</option>
            ))}
          </select>

          <select
            className="form-control"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            style={{ margin: 0 }}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem.id} value={sem.id}>{sem.name}</option>
            ))}
          </select>

          <select
            className="form-control"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            style={{ margin: 0 }}
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>
        </div>
      </div>

      {/* Marks List Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Subject</th>
              <th>Semester</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Pre-Mid (30)</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Post-Mid (70)</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Total (100)</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Grade</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMarks.map((mark) => {
              const isEditable = canEditRecord(mark.subjectCode);
              return (
                <tr key={mark.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{mark.studentRoll}</td>
                  <td style={{ fontWeight: 600 }}>{getStudentName(mark.studentRoll)}</td>
                  <td><strong>{mark.subjectCode}</strong></td>
                  <td>{getSubjectSemesterName(mark.subjectCode)}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{mark.preMid}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{mark.postMid}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary)' }}>{mark.total}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${
                      mark.grade === 'Ex' || mark.grade === 'A' ? 'badge-success' :
                      mark.grade === 'B' || mark.grade === 'C' ? 'badge-info' :
                      mark.grade === 'D' || mark.grade === 'P' ? 'badge-warning' :
                      'badge-danger'
                    }`} style={{ minWidth: '40px', textAlign: 'center' }}>
                      {mark.grade}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isEditable ? (
                      <button 
                        onClick={() => handleOpenEdit(mark)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem' }}
                        title="Update Marks Record"
                      >
                        <Edit2 size={12} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} title="Access Restricted">Read-only</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredMarks.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No marks registered for the filtered parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Marks Dialog */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Student Marks Details</h3>
              <button className="modal-close" onClick={() => setEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{
                  backgroundColor: 'var(--bg-app)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem'
                }}>
                  <p>Student: <strong>{editRecord.name} ({editRecord.studentRoll})</strong></p>
                  <p style={{ marginTop: '4px' }}>Subject: <strong>{editRecord.subjectCode}</strong></p>
                </div>

                {error && (
                  <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', margin: 0 }}>
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-pre">Pre Mid-Sem Marks (Max 30)</label>
                    <input
                      id="edit-pre"
                      type="number"
                      min="0"
                      max="30"
                      className="form-control"
                      value={editRecord.preMid}
                      onChange={(e) => handleEditChange('preMid', e.target.value)}
                      style={{ fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-post">Post Mid-Sem Marks (Max 70)</label>
                    <input
                      id="edit-post"
                      type="number"
                      min="0"
                      max="70"
                      className="form-control"
                      value={editRecord.postMid}
                      onChange={(e) => handleEditChange('postMid', e.target.value)}
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <span>Total Calculated Score:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                    {(Number(editRecord.preMid) || 0) + (Number(editRecord.postMid) || 0)} / 100
                  </span>
                </div>

                {editRecord.error && (
                  <span style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={14} />
                    {editRecord.error}
                  </span>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!!editRecord.error}>
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
