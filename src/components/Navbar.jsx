import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="navbar-header" style={{
      backgroundColor: 'var(--primary)',
      color: '#ffffff',
      height: '70px',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '3px solid var(--accent)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left section: Toggler & Branding */}
      <div style={{ display: 'flex', alignHover: 'center', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onToggleSidebar} 
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          className="sidebar-toggler"
          title="Toggle Navigation Menu"
        >
          <Menu size={24} />
        </button>

        <div className="header-banner">
          <img 
            src={logo} 
            alt="NIT Rourkela Logo" 
            style={{ width: '40px', height: '40px', objectFit: 'contain' }} 
          />
          <div className="header-title-container">
            <span className="header-inst-name">National Institute of Technology Rourkela</span>
            <span className="header-system-name">Academic Marks Management System</span>
          </div>
        </div>
      </div>

      {/* Right section: Profile & Dropdown */}
      <div style={{ position: 'relative' }}>
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            transition: 'background-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#ffffff',
            fontSize: '0.95rem'
          }}>
            {user.name ? user.name.split(' ').pop().charAt(0) : 'U'}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="user-details-desktop">
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)' }}>{user.role}</span>
          </div>
          
          <ChevronDown size={14} style={{ opacity: 0.8 }} />
        </div>

        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: '50px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            width: '200px',
            border: '1px solid var(--border)',
            padding: '0.5rem 0',
            color: 'var(--text-main)',
            animation: 'fadeIn var(--transition-fast)'
          }}>
            <div style={{
              padding: '0.5rem 1rem',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '0.5rem'
            }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
            
            <button 
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--error)',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
