import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, X, ShieldAlert } from 'lucide-react';

export default function FacultyManagement() {
  const { faculty, saveFaculty, deleteFaculty } = useAcademic();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentFaculty, setCurrentFaculty] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sub-Coordinator',
    department: 'Computer Science & Engineering'
  });

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Eng.',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Civil Engineering',
    'Metallurgical & Materials Eng.'
  ];

  const roles = [
    'Admin',
    'Course Coordinator',
    'Sub-Coordinator'
  ];

  const openCreateModal = () => {
    setCurrentFaculty({
      name: '',
      email: '',
      password: '',
      role: 'Sub-Coordinator',
      department: departments[0]
    });
    setIsEditing(false);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setCurrentFaculty({
      ...member,
      password: '' // Don't expose passwords in form, only update if typed
    });
    setIsEditing(true);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentFaculty.name.trim() || !currentFaculty.email.trim()) {
      setError('Please fill in both Faculty Name and Email ID.');
      return;
    }
    if (!currentFaculty.email.endsWith('@nitrkl.ac.in')) {
      setError('Official email must end with @nitrkl.ac.in.');
      return;
    }
    if (!isEditing && !currentFaculty.password.trim()) {
      setError('Please set an initial login password.');
      return;
    }

    try {
      await saveFaculty(currentFaculty);
      setSuccess(`Faculty '${currentFaculty.name}' details saved.`);
      setModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error saving faculty record.');
    }
  };

  const handleDelete = async (member) => {
    if (member.email === 'admin@nitrkl.ac.in') {
      setError('Cannot delete the root administrator account.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (window.confirm(`Are you sure you want to delete faculty member '${member.name}'? This will remove all their course assignments.`)) {
      try {
        await deleteFaculty(member.id);
        setSuccess('Faculty member removed.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Error deleting faculty member.');
        setTimeout(() => setError(''), 4000);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Faculty Roster</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          Register Faculty
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

      {/* Roster Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Email Address</th>
              <th>Department</th>
              <th>Authorization Role</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((member) => (
              <tr key={member.id}>
                <td style={{ fontWeight: 600 }}>{member.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{member.email}</td>
                <td>{member.department}</td>
                <td>
                  <span className={`badge ${
                    member.role === 'Admin' ? 'badge-danger' : 
                    member.role === 'Course Coordinator' ? 'badge-warning' : 
                    'badge-success'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => openEditModal(member)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--primary)' }}
                    title="Edit Details"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(member)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--error)' }}
                    title="Remove Faculty"
                    disabled={member.email === 'admin@nitrkl.ac.in'}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {faculty.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No faculty records found in database.
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
              <h3>{isEditing ? `Edit details for ${currentFaculty.name}` : 'Register Faculty Member'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {error && (
                  <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', margin: 0 }}>
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="fac-name">Faculty Member Name</label>
                  <input
                    id="fac-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Ramesh Chandra"
                    value={currentFaculty.name}
                    onChange={(e) => setCurrentFaculty({ ...currentFaculty, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fac-email">Official Email Address</label>
                  <input
                    id="fac-email"
                    type="email"
                    className="form-control"
                    placeholder="username@nitrkl.ac.in"
                    value={currentFaculty.email}
                    onChange={(e) => setCurrentFaculty({ ...currentFaculty, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fac-password">
                    {isEditing ? 'Login Password (Leave empty to keep current)' : 'Initial Portal Password'}
                  </label>
                  <input
                    id="fac-password"
                    type="password"
                    className="form-control"
                    placeholder={isEditing ? '••••••••' : 'Set initial password'}
                    value={currentFaculty.password}
                    onChange={(e) => setCurrentFaculty({ ...currentFaculty, password: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fac-department">Department Section</label>
                    <select
                      id="fac-department"
                      className="form-control"
                      value={currentFaculty.department}
                      onChange={(e) => setCurrentFaculty({ ...currentFaculty, department: e.target.value })}
                    >
                      {departments.map((dept, i) => (
                        <option key={i} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fac-role">System Authorization Role</label>
                    <select
                      id="fac-role"
                      className="form-control"
                      value={currentFaculty.role}
                      onChange={(e) => setCurrentFaculty({ ...currentFaculty, role: e.target.value })}
                    >
                      {roles.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
