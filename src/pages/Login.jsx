import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertTriangle, LogIn } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login() {
  const { login, error: authError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  // Quick fill logins for B.Tech project evaluation demo
  const quickAccessLogins = [
    { label: 'Admin (System)', email: 'admin@nitrkl.ac.in', pass: 'admin123', bg: 'var(--primary)' },
    { label: 'Coordinator (Dr. Ramesh)', email: 'cc1@nitrkl.ac.in', pass: 'cc123', bg: '#006699' },
    { label: 'Sub-Coordinator (Dr. Amit)', email: 'sc1@nitrkl.ac.in', pass: 'sub123', bg: 'var(--accent)' }
  ];

  const handleQuickFill = (item) => {
    setEmail(item.email);
    setPassword(item.pass);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a2c5c 0%, #16407d 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background vectors */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(229, 142, 38, 0.1)',
        top: '-100px',
        right: '-100px',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.03)',
        bottom: '-150px',
        left: '-150px',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '450px',
        zIndex: 10
      }}>
        {/* Logo and branding header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#ffffff'
        }}>
          <img 
            src={logo} 
            alt="NIT Rourkela Crest" 
            style={{ width: '80px', height: '80px', marginBottom: '1rem', filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))' }} 
          />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.5px' }}>
            NATIONAL INSTITUTE OF TECHNOLOGY
          </h1>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent)', marginTop: '0.2rem' }}>
            ROURKELA
          </h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
            Academic Marks Management System (MMS)
          </p>
        </div>

        {/* Login form Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>Faculty Portal Login</h3>

          {(error || authError) && (
            <div className="alert alert-danger" style={{ padding: '0.75rem 1rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{error || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Institute Email ID</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="name@nitrkl.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 6px rgba(10, 44, 92, 0.15)'
              }}
            >
              {loading ? (
                <span>Authenticating User...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <LogIn size={18} />
                  Login Securely
                </span>
              )}
            </button>
          </form>

          {/* Quick Access Demo Accounts section */}
          <div style={{
            marginTop: '2rem',
            borderTop: '1px dashed var(--border)',
            paddingTop: '1.25rem'
          }}>
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginBottom: '0.75rem',
              letterSpacing: '1px'
            }}>Quick Access Demo Accounts</p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {quickAccessLogins.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickFill(item)}
                  type="button"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.bg;
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                  }}
                >
                  <span style={{ color: 'var(--text-main)' }}>{item.label}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#ffffff',
                    backgroundColor: item.bg,
                    padding: '1px 6px',
                    borderRadius: '3px'
                  }}>Load Details</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer creds */}
        <p style={{
          textAlign: 'center',
          color: '#ffffff',
          opacity: 0.6,
          fontSize: '0.75rem',
          marginTop: '1.5rem'
        }}>
          &copy; 2026 NIT Rourkela. B.Tech Computer Science Capstone Project.
        </p>
      </div>
    </div>
  );
}
