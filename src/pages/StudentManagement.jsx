import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, X, Search, Filter } from 'lucide-react';

export default function StudentManagement() {
  const { students, semesters, saveStudent, deleteStudent } = useAcademic();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState(''); // Section filter state

  const [currentStudent, setCurrentStudent] = useState({
    rollNumber: '',
    name: '',
    email: '',
    branch: 'CSE',
    semesterId: '',
    section: 'A'
  });

  const branches = ['CSE', 'ECE', 'ME', 'EE', 'CHE', 'CE', 'MME'];
  const sections = ['A', 'B', 'C', 'D'];

  const openCreateModal = () => {
    setCurrentStudent({
      rollNumber: '',
      name: '',
      email: '',
      branch: 'CSE',
      semesterId: semesters.length > 0 ? semesters[0].id : '',
      section: 'A'
    });
    setIsEditing(false);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (stud) => {
    setCurrentStudent({ ...stud });
    setIsEditing(true);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentStudent.rollNumber.trim() || !currentStudent.name.trim()) {
      setError('Please fill in both student Roll Number and Full Name.');
      return;
    }
    if (!currentStudent.semesterId) {
      setError('Please map the student to a Semester term.');
      return;
    }

    // Auto-generate NITR email if empty
    let email = currentStudent.email.trim();
    if (!email) {
      email = `${currentStudent.rollNumber.toLowerCase()}@nitrkl.ac.in`;
    }

    const payload = {
      ...currentStudent,
      rollNumber: currentStudent.rollNumber.toUpperCase().trim(),
      email
    };

    try {
      await saveStudent(payload);
      setSuccess(`Student '${payload.name}' (${payload.rollNumber}) saved successfully.`);
      setModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error saving student records.');
    }
  };

  const handleDelete = async (rollNumber, name) => {
    if (window.confirm(`Are you sure you want to delete student '${name}' (${rollNumber})? This will delete all their registered evaluation marks.`)) {
      try {
        await deleteStudent(rollNumber);
        setSuccess('Student record deleted.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Error deleting student.');
        setTimeout(() => setError(''), 4000);
      }
    }
  };

  const getSemesterName = (semId) => {
    const sem = semesters.find(s => s.id === semId);
    return sem ? sem.name : 'Unmapped';
  };

  // Filter students based on search query, branch, semester, and section
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === '' || student.branch === branchFilter;
    const matchesSemester = semesterFilter === '' || student.semesterId === semesterFilter;
    const matchesSection = sectionFilter === '' || student.section === sectionFilter;
    return matchesSearch && matchesBranch && matchesSemester && matchesSection;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Student Directory</h2>
        <button className="btn btn-primary" onClick={openCreateModal} disabled={semesters.length === 0}>
          <Plus size={16} />
          Register Student
        </button>
      </div>

      {semesters.length === 0 && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span><strong>Action Required:</strong> Please register academic semesters before adding student records.</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by student name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px', margin: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-control"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{ margin: 0 }}
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <select
            className="form-control"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            style={{ margin: 0 }}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem.id} value={sem.id}>{sem.name}</option>
            ))}
          </select>

          <select
            className="form-control"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
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

      {/* Students Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Full Name</th>
              <th>Official Email</th>
              <th>Branch</th>
              <th>Semester Mapping</th>
              <th>Section</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((stud) => (
              <tr key={stud.rollNumber}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{stud.rollNumber}</td>
                <td style={{ fontWeight: 600 }}>{stud.name}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stud.email}</td>
                <td>
                  <span className="badge badge-info">{stud.branch}</span>
                </td>
                <td>{getSemesterName(stud.semesterId)}</td>
                <td><strong>{stud.section}</strong></td>
                <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => openEditModal(stud)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--primary)' }}
                    title="Edit Record"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(stud.rollNumber, stud.name)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem', color: 'var(--error)' }}
                    title="Delete Record"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No student records matched your search query or filters.
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
              <h3>{isEditing ? `Edit Details for ${currentStudent.name}` : 'Register Student'}</h3>
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
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="stud-roll">Roll Number</label>
                    <input
                      id="stud-roll"
                      type="text"
                      className="form-control"
                      placeholder="e.g. 122CS0101"
                      value={currentStudent.rollNumber}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, rollNumber: e.target.value })}
                      disabled={isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stud-branch">Branch / Major</label>
                    <select
                      id="stud-branch"
                      className="form-control"
                      value={currentStudent.branch}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, branch: e.target.value })}
                    >
                      {branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="stud-name">Student Full Name</label>
                  <input
                    id="stud-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aarav Sharma"
                    value={currentStudent.name}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stud-email">Official Email (Optional - will auto-generate)</label>
                  <input
                    id="stud-email"
                    type="email"
                    className="form-control"
                    placeholder="e.g. 122cs0101@nitrkl.ac.in"
                    value={currentStudent.email}
                    onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="stud-semester">Semester Mapping</label>
                    <select
                      id="stud-semester"
                      className="form-control"
                      value={currentStudent.semesterId}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, semesterId: e.target.value })}
                    >
                      <option value="">-- Choose Semester --</option>
                      {semesters.map(sem => (
                        <option key={sem.id} value={sem.id}>{sem.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="stud-section">Section Assignment</label>
                    <select
                      id="stud-section"
                      className="form-control"
                      value={currentStudent.section}
                      onChange={(e) => setCurrentStudent({ ...currentStudent, section: e.target.value })}
                    >
                      {sections.map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
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
                  {isEditing ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
