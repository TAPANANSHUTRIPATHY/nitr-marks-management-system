import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function SessionManagement() {
  const { sessions, saveSession, deleteSession, setActiveSession } = useAcademic();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState({ name: '', isActive: false });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const openCreateModal = () => {
    setCurrentSession({ name: '', isActive: false });
    setIsEditing(false);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (sess) => {
    setCurrentSession({ ...sess });
    setIsEditing(true);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentSession.name.trim()) {
      setError('Session name cannot be empty.');
      return;
    }

    try {
      await saveSession(currentSession);
      setSuccess(`Session '${currentSession.name}' saved successfully.`);
      setModalOpen(false);
      // Auto dismiss success alert
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error saving session.');
    }
  };

  const handleDelete = async (id, name, isActive) => {
    if (isActive) {
      setError('Cannot delete the currently active session. Please activate another session first.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (window.confirm(`Are you sure you want to delete session '${name}'?`)) {
      try {
        await deleteSession(id);
        setSuccess('Session deleted successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Error deleting session.');
        setTimeout(() => setError(''), 4000);
      }
    }
  };

  const handleActivate = async (id, name) => {
    try {
      await setActiveSession(id);
      setSuccess(`Session '${name}' is now activated.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to activate session.');
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Academic Sessions</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          Create New Session
        </button>
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

      {/* Sessions Grid / Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Session Name</th>
              <th>Status</th>
              <th style={{ width: '220px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((sess) => (
              <tr key={sess.id}>
                <td style={{ fontWeight: 600 }}>{sess.name}</td>
                <td>
                  {sess.isActive ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-info">Inactive</span>
                  )}
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  {!sess.isActive && (
                    <button 
                      onClick={() => handleActivate(sess.id, sess.name)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                      title="Activate this Session"
                    >
                      Activate
                    </button>
                  )}
                  <button 
                    onClick={() => openEditModal(sess)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--primary)' }}
                    title="Edit Session Name"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(sess.id, sess.name, sess.isActive)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--error)' }}
                    title="Delete Session"
                    disabled={sess.isActive}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No academic sessions registered in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal Dialog */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Session' : 'Create Academic Session'}</h3>
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
                  <label htmlFor="sess-name">Academic Session Name</label>
                  <input
                    id="sess-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Autumn Semester 2026-27"
                    value={currentSession.name}
                    onChange={(e) => setCurrentSession({ ...currentSession, name: e.target.value })}
                  />
                </div>

                {!isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      id="sess-active"
                      type="checkbox"
                      checked={currentSession.isActive}
                      onChange={(e) => setCurrentSession({ ...currentSession, isActive: e.target.checked })}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="sess-active" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      Set as current Active Session immediately
                    </label>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Changes' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
