import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function SubjectManagement() {
  const { subjects, semesters, faculty, saveSubject, deleteSubject } = useAcademic();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentSubject, setCurrentSubject] = useState({
    code: '',
    name: '',
    credits: 4,
    semesterId: '',
    coordinatorId: '',
    subCoordinators: []
  });

  // Filter faculty by roles
  const coordinatorsList = faculty.filter(f => f.role === 'Course Coordinator');
  const subCoordinatorsList = faculty.filter(f => f.role === 'Sub-Coordinator');

  const openCreateModal = () => {
    setCurrentSubject({
      code: '',
      name: '',
      credits: 4,
      semesterId: semesters.length > 0 ? semesters[0].id : '',
      coordinatorId: coordinatorsList.length > 0 ? coordinatorsList[0].id : '',
      subCoordinators: []
    });
    setIsEditing(false);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (sub) => {
    setCurrentSubject({
      ...sub,
      subCoordinators: sub.subCoordinators || []
    });
    setIsEditing(true);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentSubject.code.trim() || !currentSubject.name.trim()) {
      setError('Please fill in both Subject Code and Name.');
      return;
    }
    if (!currentSubject.semesterId) {
      setError('Please assign the subject to a Semester.');
      return;
    }
    if (!currentSubject.coordinatorId) {
      setError('Please assign one Course Coordinator.');
      return;
    }

    try {
      await saveSubject(currentSubject);
      setSuccess(`Subject '${currentSubject.code}' saved successfully.`);
      setModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error saving subject.');
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete subject '${code}'? This will remove all mapped evaluation marks.`)) {
      try {
        await deleteSubject(id);
        setSuccess('Subject deleted successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Error deleting subject.');
        setTimeout(() => setError(''), 4000);
      }
    }
  };

  const handleSubCoordinatorToggle = (scId) => {
    const subs = [...currentSubject.subCoordinators];
    const index = subs.indexOf(scId);
    if (index === -1) {
      subs.push(scId);
    } else {
      subs.splice(index, 1);
    }
    setCurrentSubject({ ...currentSubject, subCoordinators: subs });
  };

  const getSemesterName = (semId) => {
    const sem = semesters.find(s => s.id === semId);
    return sem ? sem.name : 'Unknown Semester';
  };

  const getFacultyName = (facId) => {
    const fac = faculty.find(f => f.id === facId);
    return fac ? fac.name : 'Unassigned';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Subject Catalog</h2>
        <button className="btn btn-primary" onClick={openCreateModal} disabled={semesters.length === 0}>
          <Plus size={16} />
          Add Subject Code
        </button>
      </div>

      {semesters.length === 0 && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span><strong>Action Required:</strong> Please configure semester terms under the Semesters page before adding subjects.</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Subjects Catalog Grid */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Title</th>
              <th>Credits</th>
              <th>Semester Mapping</th>
              <th>Course Coordinator</th>
              <th>Sub-Coordinators</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub) => (
              <tr key={sub.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{sub.code}</td>
                <td style={{ fontWeight: 600 }}>{sub.name}</td>
                <td>
                  <span className="badge badge-info">{sub.credits} Credits</span>
                </td>
                <td>{getSemesterName(sub.semesterId)}</td>
                <td style={{ fontSize: '0.85rem' }}>{getFacultyName(sub.coordinatorId)}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {sub.subCoordinators && sub.subCoordinators.length > 0 ? (
                    <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                      {sub.subCoordinators.map(scId => (
                        <li key={scId}>{getFacultyName(scId)}</li>
                      ))}
                    </ul>
                  ) : (
                    <i>None assigned</i>
                  )}
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => openEditModal(sub)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--primary)' }}
                    title="Edit Subject"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(sub.id, sub.code)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--error)' }}
                    title="Delete Subject"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No academic subjects registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? `Edit Subject ${currentSubject.code}` : 'Register New Subject'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {error && (
                  <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', margin: 0 }}>
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sub-code">Subject Code</label>
                    <input
                      id="sub-code"
                      type="text"
                      className="form-control"
                      placeholder="e.g. CS-301"
                      value={currentSubject.code}
                      onChange={(e) => setCurrentSubject({ ...currentSubject, code: e.target.value })}
                      disabled={isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sub-credits">Credit Rating</label>
                    <input
                      id="sub-credits"
                      type="number"
                      min="1"
                      max="6"
                      className="form-control"
                      value={currentSubject.credits}
                      onChange={(e) => setCurrentSubject({ ...currentSubject, credits: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="sub-name">Subject Title</label>
                  <input
                    id="sub-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Database Management Systems"
                    value={currentSubject.name}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sub-semester">Semester Mapping</label>
                  <select
                    id="sub-semester"
                    className="form-control"
                    value={currentSubject.semesterId}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, semesterId: e.target.value })}
                  >
                    <option value="">-- Choose Semester --</option>
                    {semesters.map(sem => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sub-coordinator">Primary Course Coordinator (Assign 1)</label>
                  <select
                    id="sub-coordinator"
                    className="form-control"
                    value={currentSubject.coordinatorId}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, coordinatorId: e.target.value })}
                  >
                    <option value="">-- Select Course Coordinator --</option>
                    {coordinatorsList.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.department})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ marginBottom: '0.2rem' }}>Sub-Coordinators (Assign Multiple)</label>
                  <div style={{
                    maxHeight: '130px',
                    overflowY: 'auto',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    backgroundColor: 'var(--bg-app)'
                  }}>
                    {subCoordinatorsList.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No Sub-Coordinators registered in faculty database.</p>
                    ) : (
                      subCoordinatorsList.map(sc => (
                        <div key={sc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                          <input
                            type="checkbox"
                            id={`sc-${sc.id}`}
                            checked={currentSubject.subCoordinators.includes(sc.id)}
                            onChange={() => handleSubCoordinatorToggle(sc.id)}
                            style={{ cursor: 'pointer' }}
                          />
                          <label htmlFor={`sc-${sc.id}`} style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                            {sc.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({sc.department})</span>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
