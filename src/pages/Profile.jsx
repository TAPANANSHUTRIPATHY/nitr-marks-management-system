import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CheckCircle2, AlertTriangle, User, Key, Building2 } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  
  // Profile update state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Eng.',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Civil Engineering',
    'Metallurgical & Materials Eng.'
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setProfileError('Name and Email cannot be empty.');
      return;
    }
    setProfileError('');
    setProfileSuccess('');
    try {
      await updateProfile(name, email, department);
      setProfileSuccess('Profile details updated successfully.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 5) {
      setPwError('New password must be at least 5 characters long.');
      return;
    }

    setPwError('');
    setPwSuccess('');
    try {
      await api.changePassword(user.id, currentPassword, newPassword);
      setPwSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    }
  };

  return (
    <div>
      <h2 className="section-title">My Profile & Settings</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="report-dashboard-sections">
        {/* Left Column: Account Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: 'var(--accent)' }} />
            Profile Details
          </h3>

          {profileSuccess && (
            <div className="alert alert-success" style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="prof-name">Full Name</label>
              <input
                id="prof-name"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prof-email">Email Address</label>
              <input
                id="prof-email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prof-dept">Academic Department</label>
              <select
                id="prof-dept"
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departments.map((dept, i) => (
                  <option key={i} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>System Access Authorization Role</label>
              <input
                type="text"
                className="form-control"
                value={user?.role || ''}
                disabled
                style={{ backgroundColor: 'var(--bg-app)', fontWeight: 700, color: 'var(--primary)' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
              Save Profile Details
            </button>
          </form>
        </div>

        {/* Right Column: Change Password */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} style={{ color: 'var(--accent)' }} />
            Security & Credentials
          </h3>

          {pwSuccess && (
            <div className="alert alert-success" style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={16} />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={16} />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="curr-pw">Current Password</label>
              <input
                id="curr-pw"
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-pw">New Password</label>
              <input
                id="new-pw"
                type="password"
                className="form-control"
                placeholder="Set new password (min 5 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-pw">Confirm New Password</label>
              <input
                id="confirm-pw"
                type="password"
                className="form-control"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-accent" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
              Update Login Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
