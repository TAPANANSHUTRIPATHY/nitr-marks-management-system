import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, BookOpen } from 'lucide-react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../api/subjectApi';
import '../../styles/pages/AdminPage.css';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', credits: 3, maxMarksPreMid: 30, maxMarksPostMid: 70 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data);
    } catch (e) {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const openCreate = () => {
    setEditingSubject(null);
    setForm({ code: '', name: '', credits: 3, maxMarksPreMid: 30, maxMarksPostMid: 70 });
    setShowModal(true);
  };

  const openEdit = (subject) => {
    setEditingSubject(subject);
    setForm({
      code: subject.code,
      name: subject.name,
      credits: subject.credits,
      maxMarksPreMid: subject.maxMarksPreMid,
      maxMarksPostMid: subject.maxMarksPostMid,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        credits: parseInt(form.credits),
        maxMarksPreMid: parseInt(form.maxMarksPreMid),
        maxMarksPostMid: parseInt(form.maxMarksPostMid),
      };
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
      } else {
        await createSubject(payload);
      }
      await fetchSubjects();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await deleteSubject(id);
      await fetchSubjects();
    } catch {
      alert('Failed to delete subject');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="page-desc">Manage subjects with marks configuration</p>
        </div>
        <button id="create-subject-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> New Subject
        </button>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loader-spinner"></div><p>Loading subjects...</p></div>
      ) : subjects.length === 0 ? (
        <div className="empty-state glass-card">
          <BookOpen size={48} />
          <h3>No Subjects Found</h3>
          <p>Add subjects to start managing marks.</p>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Subject</button>
        </div>
      ) : (
        <div className="table-wrapper glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Credits</th>
                <th>Max Pre-Mid</th>
                <th>Max Post-Mid</th>
                <th>Total Max</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td><code className="code-tag">{s.code}</code></td>
                  <td className="cell-primary">{s.name}</td>
                  <td>{s.credits}</td>
                  <td>{s.maxMarksPreMid}</td>
                  <td>{s.maxMarksPostMid}</td>
                  <td className="cell-primary">{(s.maxMarksPreMid || 0) + (s.maxMarksPostMid || 0)}</td>
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
              <h2>{editingSubject ? 'Edit Subject' : 'New Subject'}</h2>
              <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject Code</label>
                  <input className="form-input" type="text" placeholder="e.g. CS301"
                    value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input className="form-input" type="number" min="1" max="10"
                    value={form.credits} onChange={e => setForm({...form, credits: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input className="form-input" type="text" placeholder="e.g. Data Structures"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max Marks Pre-Mid</label>
                  <input className="form-input" type="number" min="0" max="100"
                    value={form.maxMarksPreMid} onChange={e => setForm({...form, maxMarksPreMid: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Marks Post-Mid</label>
                  <input className="form-input" type="number" min="0" max="100"
                    value={form.maxMarksPostMid} onChange={e => setForm({...form, maxMarksPostMid: e.target.value})} required />
                </div>
              </div>
              <div className="total-display">
                Total Max: <strong>{parseInt(form.maxMarksPreMid || 0) + parseInt(form.maxMarksPostMid || 0)}</strong>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button id="subject-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="btn-spinner"></span> : <Check size={18} />}
                  {editingSubject ? 'Update' : 'Create'} Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
