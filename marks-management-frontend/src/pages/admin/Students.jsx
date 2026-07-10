import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, GraduationCap, Upload, FileText } from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent, importStudentsCSV } from '../../api/studentApi';
import { getSessions } from '../../api/sessionApi';
import '../../styles/pages/AdminPage.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({ rollNumber: '', name: '', email: '', department: '', currentSemester: 1, sessionId: '' });
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [stuRes, sessRes] = await Promise.all([getStudents(), getSessions()]);
      setStudents(stuRes.data);
      setSessions(sessRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingStudent(null);
    setForm({ rollNumber: '', name: '', email: '', department: '', currentSemester: 1, sessionId: sessions[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditingStudent(s);
    setForm({ rollNumber: s.rollNumber, name: s.name, email: s.email || '', department: s.department || '', currentSemester: s.currentSemester, sessionId: s.sessionId || '' });
    setShowModal(true);
  };

  const openImport = () => {
    setCsvFile(null);
    setImportError('');
    setSuccessMsg('');
    setShowImportModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingStudent(null); setError(''); };
  const closeImportModal = () => { setShowImportModal(false); setCsvFile(null); setImportError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, currentSemester: parseInt(form.currentSemester) };
      if (editingStudent) {
        await updateStudent(editingStudent.id, payload);
      } else {
        await createStudent(payload);
      }
      await fetchData();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setImporting(true);
    setImportError('');
    setSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      await importStudentsCSV(formData);
      setSuccessMsg('Students imported successfully!');
      await fetchData();
      setTimeout(() => closeImportModal(), 2000);
    } catch (err) {
      setImportError(err.response?.data?.message || 'Failed to import CSV file. Ensure format matches the requirements.');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try { await deleteStudent(id); await fetchData(); }
    catch { alert('Failed to delete student'); }
  };

  const filtered = students.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-desc">Manage student records, enrollments and bulk CSV imports</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={openImport}>
            <Upload size={18} /> Bulk Import CSV
          </button>
          <button id="create-student-btn" className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <input className="filter-input" type="text" placeholder="Search students..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-state"><div className="loader-spinner"></div><p>Loading students...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-card">
          <GraduationCap size={48} />
          <h3>No Students Found</h3>
          <p>{search ? 'No results match your search.' : 'Add students or import via CSV.'}</p>
          {!search && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn btn-ghost" onClick={openImport}><Upload size={18} /> Import CSV</button>
              <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Student</button>
            </div>
          )}
        </div>
      ) : (
        <div className="table-wrapper glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Name</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><code className="code-tag">{s.rollNumber}</code></td>
                  <td className="cell-primary">{s.name}</td>
                  <td>{s.department || '—'}</td>
                  <td>Sem {s.currentSemester}</td>
                  <td>{s.email || '—'}</td>
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
          <div className="modal glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
              <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input className="form-input" type="text" placeholder="e.g. 22CS001"
                    value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Semester</label>
                  <input className="form-input" type="number" min="1" max="8"
                    value={form.currentSemester} onChange={e => setForm({...form, currentSemester: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Student Full Name"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" type="text" placeholder="Computer Science"
                    value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Session</label>
                  <select className="form-input" value={form.sessionId}
                    onChange={e => setForm({...form, sessionId: e.target.value})}>
                    <option value="">Select session...</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input className="form-input" type="email" placeholder="student@nitrourkela.ac.in"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button id="student-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="btn-spinner"></span> : <Check size={18} />}
                  {editingStudent ? 'Update' : 'Add'} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={closeImportModal}>
          <div className="modal glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bulk Import Students</h2>
              <button className="modal-close-btn" onClick={closeImportModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleImportSubmit} className="modal-form">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Upload a CSV file containing student records. The CSV file must have headers matching:
                <br />
                <code>rollNumber,name,email,department,currentSemester,sessionName</code>
              </p>
              <div className="form-group" style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '30px', textAlign: 'center', background: 'var(--bg-secondary)', position: 'relative' }}>
                <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <FileText size={32} style={{ color: 'var(--teal-accent)' }} />
                  <strong>{csvFile ? csvFile.name : 'Select or drag & drop CSV file'}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Only CSV files supported</span>
                </div>
              </div>
              {importError && <div className="form-error">{importError}</div>}
              {successMsg && <div className="success-toast">{successMsg}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeImportModal} disabled={importing}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!csvFile || importing}>
                  {importing ? <span className="btn-spinner"></span> : <Upload size={18} />}
                  <span>Upload CSV</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
