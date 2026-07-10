import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Layers, BookOpen, Link, Unlink } from 'lucide-react';
import { getSessions } from '../../api/sessionApi';
import { getSemesters, createSemester, updateSemester, deleteSemester, getSubjectsForSemester, mapSubjectToSemester, unmapSubjectFromSemester } from '../../api/semesterApi';
import { getSubjects } from '../../api/subjectApi';
import '../../styles/pages/AdminPage.css';

const SEMESTER_TYPES = ['ODD', 'EVEN'];

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [mappingSemester, setMappingSemester] = useState(null);
  const [mappedSubjectIds, setMappedSubjectIds] = useState(new Set());
  const [form, setForm] = useState({ number: 1, type: 'ODD', sessionId: '', isActive: false });
  const [saving, setSaving] = useState(false);
  const [mappingSaving, setMappingSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [semRes, sessRes, subjRes] = await Promise.all([
        getSemesters(),
        getSessions(),
        getSubjects()
      ]);
      setSemesters(semRes.data);
      setSessions(sessRes.data);
      setSubjects(subjRes.data);
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingSemester(null);
    setForm({ number: 1, type: 'ODD', sessionId: sessions[0]?.id || '', isActive: false });
    setShowModal(true);
  };

  const openEdit = (sem) => {
    setEditingSemester(sem);
    setForm({ number: sem.number, type: sem.type, sessionId: sem.sessionId || '', isActive: sem.isActive || false });
    setShowModal(true);
  };

  const openMapping = async (sem) => {
    setMappingSemester(sem);
    setMappingSaving(true);
    try {
      const res = await getSubjectsForSemester(sem.id);
      // Backend returns SemesterSubject list
      const mappedIds = new Set((res.data || []).map(ss => ss.subject?.id).filter(Boolean));
      setMappedSubjectIds(mappedIds);
      setShowMappingModal(true);
    } catch {
      alert('Failed to load mapped subjects');
    } finally {
      setMappingSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSemester(null);
    setError('');
  };

  const closeMappingModal = () => {
    setShowMappingModal(false);
    setMappingSemester(null);
    setMappedSubjectIds(new Set());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, number: parseInt(form.number) };
      if (editingSemester) {
        await updateSemester(editingSemester.id, payload);
      } else {
        await createSemester(payload);
      }
      await fetchData();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save semester');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMapping = async (subjectId) => {
    if (!mappingSemester) return;
    const isMapped = mappedSubjectIds.has(subjectId);
    try {
      if (isMapped) {
        await unmapSubjectFromSemester(mappingSemester.id, subjectId);
        setMappedSubjectIds(prev => {
          const next = new Set(prev);
          next.delete(subjectId);
          return next;
        });
      } else {
        await mapSubjectToSemester(mappingSemester.id, subjectId);
        setMappedSubjectIds(prev => {
          const next = new Set(prev);
          next.add(subjectId);
          return next;
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update subject mapping');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this semester?')) return;
    try {
      await deleteSemester(id);
      await fetchData();
    } catch {
      alert('Failed to delete semester');
    }
  };

  const getSessionName = (sessionId) => sessions.find(s => s.id === sessionId)?.name || '—';

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Semesters</h1>
          <p className="page-desc">Manage semesters under academic sessions and map subjects</p>
        </div>
        <button id="create-semester-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> New Semester
        </button>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loader-spinner"></div><p>Loading semesters...</p></div>
      ) : semesters.length === 0 ? (
        <div className="empty-state glass-card">
          <Layers size={48} />
          <h3>No Semesters Found</h3>
          <p>Create semesters after adding academic sessions.</p>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Semester</button>
        </div>
      ) : (
        <div className="table-wrapper glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Semester No.</th>
                <th>Type</th>
                <th>Session</th>
                <th>Status</th>
                <th>Subject Mapping</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((s) => (
                <tr key={s.id}>
                  <td className="cell-primary">Semester {s.number}</td>
                  <td>
                    <span className={`status-badge ${s.type === 'ODD' ? 'status-odd' : 'status-even'}`}>
                      {s.type}
                    </span>
                  </td>
                  <td>{getSessionName(s.sessionId)}</td>
                  <td>
                    <span className={`status-badge ${s.isActive ? 'status-active' : 'status-inactive'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => openMapping(s)}>
                      <BookOpen size={14} /> Map Subjects
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn edit-btn" onClick={() => openEdit(s)} title="Edit"><Pencil size={15} /></button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(s.id)} title="Delete"><Trash2 size={15} /></button>
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
              <h2>{editingSemester ? 'Edit Semester' : 'New Semester'}</h2>
              <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Academic Session</label>
                <select className="form-input" value={form.sessionId}
                  onChange={e => setForm({...form, sessionId: e.target.value})} required>
                  <option value="">Select session...</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Semester Number</label>
                  <input className="form-input" type="number" min="1" max="8"
                    value={form.number} onChange={e => setForm({...form, number: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}>
                    {SEMESTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group form-check">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm({...form, isActive: e.target.checked})} />
                  <span>Set as Active Semester</span>
                </label>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button id="semester-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="btn-spinner"></span> : <Check size={18} />}
                  {editingSemester ? 'Update' : 'Create'} Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMappingModal && mappingSemester && (
        <div className="modal-overlay" onClick={closeMappingModal}>
          <div className="modal glass-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Subject Mapping</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Map subjects to Semester {mappingSemester.number} ({getSessionName(mappingSemester.sessionId)})
                </p>
              </div>
              <button className="modal-close-btn" onClick={closeMappingModal}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px 28px', maxHeight: '400px', overflowY: 'auto' }}>
              {subjects.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No subjects found. Add subjects first.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {subjects.map(subj => {
                    const isMapped = mappedSubjectIds.has(subj.id);
                    return (
                      <div key={subj.id} className="glass-card" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'between',
                        padding: '12px 18px',
                        gap: '16px',
                        borderColor: isMapped ? 'var(--teal-accent)' : 'var(--border-color)',
                        background: isMapped ? 'var(--teal-accent-glow)' : 'var(--bg-secondary)'
                      }}>
                        <div style={{ flex: 1 }}>
                          <code className="code-tag">{subj.code}</code>
                          <strong style={{ marginLeft: '10px', fontSize: '14px', color: 'var(--text-primary)' }}>{subj.name}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>({subj.credits} Credits)</span>
                        </div>
                        <button
                          className={`btn ${isMapped ? 'btn-danger' : 'btn-primary'}`}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleToggleMapping(subj.id)}
                        >
                          {isMapped ? <Unlink size={14} /> : <Link size={14} />}
                          <span>{isMapped ? 'Unmap' : 'Map'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ padding: '16px 28px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-primary" onClick={closeMappingModal}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Semesters;
