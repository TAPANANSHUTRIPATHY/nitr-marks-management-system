import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function SemesterManagement() {
  const { semesters, sessions, saveSemester, deleteSemester } = useAcademic();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSemester, setCurrentSemester] = useState({ name: '', sessionId: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const openCreateModal = () => {
    // Default to the first session if available
    const defaultSessId = sessions.find(s => s.isActive)?.id || (sessions.length > 0 ? sessions[0].id : '');
    setCurrentSemester({ name: '', sessionId: defaultSessId });
    setIsEditing(false);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (sem) => {
    setCurrentSemester({ ...sem });
    setIsEditing(true);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentSemester.name.trim()) {
      setError('Semester name cannot be empty.');
      return;
    }
    if (!currentSemester.sessionId) {
      setError('Please map this semester to an academic session.');
      return;
    }

    try {
      await saveSemester(currentSemester);
      setSuccess(`Semester '${currentSemester.name}' saved successfully.`);
      setModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error saving semester.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete semester '${name}'? This may affect student registrations and subject mappings.`)) {
      try {
        await deleteSemester(id);
        setSuccess('Semester deleted successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Error deleting semester.');
        setTimeout(() => setError(''), 4000);
      }
    }
  };

  // Helper to map sessionId to Session Name
  const getSessionName = (sessId) => {
    const session = sessions.find(s => s.id === sessId);
    return session ? session.name : 'Unknown Session';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Semesters Setup</h2>
        <button className="btn btn-primary" onClick={openCreateModal} disabled={sessions.length === 0}>
          <Plus size={16} />
          Add Semester Term
        </button>
      </div>

      {sessions.length === 0 && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span><strong>Action Required:</strong> Please register at least one Academic Session first before defining semesters.</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Semesters Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Semester Name</th>
              <th>Mapped Academic Session</th>
              <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((sem) => (
              <tr key={sem.id}>
                <td style={{ fontWeight: 600 }}>{sem.name}</td>
                <td>{getSessionName(sem.sessionId)}</td>
                <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => openEditModal(sem)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--primary)' }}
                    title="Edit Semester"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(sem.id, sem.name)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--error)' }}
                    title="Delete Semester"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {semesters.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No semester terms defined in the system database.
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
              <h3>{isEditing ? 'Edit Semester Term' : 'Define Semester Term'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="sem-name">Semester Name</label>
                  <input
                    id="sem-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5th Semester"
                    value={currentSemester.name}
                    onChange={(e) => setCurrentSemester({ ...currentSemester, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sem-session">Parent Academic Session</label>
                  <select
                    id="sem-session"
                    className="form-control"
                    value={currentSemester.sessionId}
                    onChange={(e) => setCurrentSemester({ ...currentSemester, sessionId: e.target.value })}
                  >
                    <option value="">-- Choose Academic Session --</option>
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.isActive && '(Active)'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Changes' : 'Save Semester'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
