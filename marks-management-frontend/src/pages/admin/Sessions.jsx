import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Calendar, Power } from 'lucide-react';
import { getSessions, createSession, updateSession, deleteSession } from '../../api/sessionApi';
import '../../styles/pages/AdminPage.css';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isActive: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      setSessions(res.data);
    } catch (e) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const openCreate = () => {
    setEditingSession(null);
    setForm({ name: '', startDate: '', endDate: '', isActive: false });
    setShowModal(true);
  };

  const openEdit = (session) => {
    setEditingSession(session);
    setForm({
      name: session.name,
      startDate: session.startDate || '',
      endDate: session.endDate || '',
      isActive: session.isActive || false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSession(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingSession) {
        await updateSession(editingSession.id, form);
      } else {
        await createSession(form);
      }
      await fetchSessions();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await deleteSession(id);
      await fetchSessions();
    } catch (err) {
      alert('Failed to delete session');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Sessions</h1>
          <p className="page-desc">Manage academic year sessions for NIT Rourkela</p>
        </div>
        <button id="create-session-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          <span>New Session</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader-spinner"></div>
          <p>Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state glass-card">
          <Calendar size={48} />
          <h3>No Sessions Found</h3>
          <p>Create your first academic session to get started.</p>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Create Session
          </button>
        </div>
      ) : (
        <div className="table-wrapper glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Session Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="cell-primary">{s.name}</td>
                  <td>{s.startDate || '—'}</td>
                  <td>{s.endDate || '—'}</td>
                  <td>
                    <span className={`status-badge ${s.isActive ? 'status-active' : 'status-inactive'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn edit-btn" onClick={() => openEdit(s)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(s.id)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal glass-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSession ? 'Edit Session' : 'New Academic Session'}</h2>
              <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Session Name</label>
                <input className="form-input" type="text" placeholder="e.g. 2024-25"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date"
                    value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date"
                    value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group form-check">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm({...form, isActive: e.target.checked})} />
                  <span>Set as Active Session</span>
                </label>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button id="session-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="btn-spinner"></span> : <Check size={18} />}
                  <span>{editingSession ? 'Update' : 'Create'} Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
