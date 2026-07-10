import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Users, BookOpen, Link, Unlink, Award } from 'lucide-react';
import { getFaculty, createFaculty, updateFaculty, deleteFaculty, assignFaculty, getFacultyAssignments, removeAssignment } from '../../api/facultyApi';
import { getSemesters, getSubjectsForSemester } from '../../api/semesterApi';
import '../../styles/pages/AdminPage.css';

const ROLES = ['ADMIN', 'FACULTY'];
const ASSIGNMENT_ROLES = ['COORDINATOR', 'SUB_COORDINATOR'];

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [semesterSubjects, setSemesterSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [assigningFaculty, setAssigningFaculty] = useState(null);
  
  // Faculty CRUD form
  const [form, setForm] = useState({ employeeId: '', name: '', email: '', password: '', globalRole: 'FACULTY', isActive: true });
  
  // Assignment form
  const [assignForm, setAssignForm] = useState({ semesterId: '', semesterSubjectId: '', assignmentRole: 'SUB_COORDINATOR', section: '' });
  
  const [saving, setSaving] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [error, setError] = useState('');
  const [assignError, setAssignError] = useState('');
  const [search, setSearch] = useState('');

  const fetchFaculty = async () => {
    try {
      const res = await getFaculty();
      setFaculty(res.data);
    } catch {
      setError('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
    getSemesters().then(r => setSemesters(r.data)).catch(() => {});
  }, []);

  const handleSemesterChange = async (semId) => {
    setAssignForm(prev => ({ ...prev, semesterId: semId, semesterSubjectId: '' }));
    if (!semId) {
      setSemesterSubjects([]);
      return;
    }
    try {
      const res = await getSubjectsForSemester(semId);
      setSemesterSubjects(res.data);
    } catch {
      setSemesterSubjects([]);
    }
  };

  const openCreate = () => {
    setEditingFaculty(null);
    setForm({ employeeId: '', name: '', email: '', password: '', globalRole: 'FACULTY', isActive: true });
    setShowModal(true);
  };

  const openEdit = (f) => {
    setEditingFaculty(f);
    setForm({ employeeId: f.employeeId, name: f.name, email: f.email, password: '', globalRole: f.globalRole, isActive: f.isActive });
    setShowModal(true);
  };

  const openAssign = async (f) => {
    setAssigningFaculty(f);
    setAssignForm({ semesterId: '', semesterSubjectId: '', assignmentRole: 'SUB_COORDINATOR', section: '' });
    setSemesterSubjects([]);
    setAssignError('');
    try {
      const res = await getFacultyAssignments(f.id);
      setAssignments(res.data || []);
      setShowAssignModal(true);
    } catch {
      alert('Failed to load assignments');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFaculty(null);
    setError('');
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssigningFaculty(null);
    setAssignments([]);
    setAssignError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (editingFaculty && !payload.password) delete payload.password;
      if (editingFaculty) {
        await updateFaculty(editingFaculty.id, payload);
      } else {
        await createFaculty(payload);
      }
      await fetchFaculty();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save faculty member');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!assigningFaculty || !assignForm.semesterSubjectId) return;
    setAssignSaving(true);
    setAssignError('');
    try {
      const payload = {
        facultyId: assigningFaculty.id,
        semesterSubjectId: assignForm.semesterSubjectId,
        assignmentRole: assignForm.assignmentRole,
        section: assignForm.section || null
      };
      await assignFaculty(payload);
      // Reload assignments
      const res = await getFacultyAssignments(assigningFaculty.id);
      setAssignments(res.data || []);
      setAssignForm(prev => ({ ...prev, semesterSubjectId: '', section: '' }));
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setAssignSaving(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      await removeAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    } catch {
      alert('Failed to remove assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return;
    try {
      await deleteFaculty(id);
      await fetchFaculty();
    } catch {
      alert('Failed to delete faculty');
    }
  };

  const filtered = faculty.filter(f =>
    !search ||
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase()) ||
    f.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty</h1>
          <p className="page-desc">Manage faculty members and course assignments</p>
        </div>
        <button id="create-faculty-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add Faculty
        </button>
      </div>

      <div className="filter-bar">
        <input className="filter-input" type="text" placeholder="Search faculty..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-state"><div className="loader-spinner"></div><p>Loading faculty...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-card">
          <Users size={48} />
          <h3>No Faculty Found</h3>
          <p>{search ? 'No results match your search.' : 'Add faculty members to assign courses.'}</p>
          {!search && <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Faculty</button>}
        </div>
      ) : (
        <div className="table-wrapper glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assignments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td><code className="code-tag">{f.employeeId}</code></td>
                  <td className="cell-primary">{f.name}</td>
                  <td>{f.email}</td>
                  <td>
                    <span className={`status-badge ${f.globalRole === 'ADMIN' ? 'status-admin' : 'status-faculty'}`}>
                      {f.globalRole}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => openAssign(f)}>
                      <Award size={14} /> Assign Courses
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn edit-btn" onClick={() => openEdit(f)} title="Edit"><Pencil size={15} /></button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(f.id)} title="Delete"><Trash2 size={15} /></button>
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
              <h2>{editingFaculty ? 'Edit Faculty Member' : 'Add Faculty Member'}</h2>
              <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input className="form-input" type="text" placeholder="e.g. FAC001"
                    value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={form.globalRole}
                    onChange={e => setForm({...form, globalRole: e.target.value})}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Dr. Jane Smith"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="jane@nitrourkela.ac.in"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">{editingFaculty ? 'New Password (leave blank to keep unchanged)' : 'Password'}</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  required={!editingFaculty} />
              </div>
              <div className="form-group form-check">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm({...form, isActive: e.target.checked})} />
                  <span>Active Account</span>
                </label>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button id="faculty-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="btn-spinner"></span> : <Check size={18} />}
                  {editingFaculty ? 'Update' : 'Add'} Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && assigningFaculty && (
        <div className="modal-overlay" onClick={closeAssignModal}>
          <div className="modal glass-modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Course Assignments</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Manage course access rules for <strong>{assigningFaculty.name}</strong> ({assigningFaculty.employeeId})
                </p>
              </div>
              <button className="modal-close-btn" onClick={closeAssignModal}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <form onSubmit={handleAddAssignment} className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Add Course Assignment</div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select className="form-input" value={assignForm.semesterId} onChange={e => handleSemesterChange(e.target.value)} required>
                      <option value="">Select Semester...</option>
                      {semesters.map(s => <option key={s.id} value={s.id}>Semester {s.number} ({s.type})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-input" value={assignForm.semesterSubjectId} onChange={e => setAssignForm({ ...assignForm, semesterSubjectId: e.target.value })} required disabled={!assignForm.semesterId}>
                      <option value="">Select Subject...</option>
                      {semesterSubjects.map(ss => <option key={ss.id} value={ss.id}>{ss.subject?.code} — {ss.subject?.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Assignment Role</label>
                    <select className="form-input" value={assignForm.assignmentRole} onChange={e => setAssignForm({ ...assignForm, assignmentRole: e.target.value })}>
                      {ASSIGNMENT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section (Optional)</label>
                    <input className="form-input" type="text" placeholder="e.g. A, B, or leave empty" value={assignForm.section} onChange={e => setAssignForm({ ...assignForm, section: e.target.value })} />
                  </div>
                </div>
                {assignError && <div className="form-error">{assignError}</div>}
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={assignSaving}>
                  {assignSaving ? <span className="btn-spinner"></span> : <Plus size={16} />} Add Assignment
                </button>
              </form>

              <div className="assignments-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Current Assignments ({assignments.length})</div>
                {assignments.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '10px 0' }}>No active assignments.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {assignments.map(a => (
                      <div key={a.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '12px 18px', gap: '16px', background: 'var(--bg-secondary)' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span className={`status-badge ${a.assignmentRole === 'COORDINATOR' ? 'status-active' : 'status-inactive'}`}>
                            {a.assignmentRole}
                          </span>
                          <div>
                            <code className="code-tag">{a.semesterSubject?.subject?.code}</code>
                            <strong style={{ marginLeft: '10px', fontSize: '14px', color: 'var(--text-primary)' }}>{a.semesterSubject?.subject?.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Semester {a.semesterSubject?.semester?.number} {a.section ? `— Section ${a.section}` : ''}
                            </div>
                          </div>
                        </div>
                        <button className="action-btn delete-btn" onClick={() => handleRemoveAssignment(a.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions" style={{ padding: '16px 28px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-primary" onClick={closeAssignModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
