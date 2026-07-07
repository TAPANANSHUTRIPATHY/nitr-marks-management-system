import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  BookOpen, 
  UserSquare2, 
  Calendar, 
  TrendingUp, 
  FileSpreadsheet, 
  Clock 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { students, subjects, faculty, activeSession, activities, loading } = useAcademic();

  const systemStats = [
    { label: 'Total Registered Students', value: students.length, icon: Users, color: '#00a8ff', desc: 'Active in session' },
    { label: 'Total Mapped Subjects', value: subjects.length, icon: BookOpen, color: '#9c88ff', desc: 'Across departments' },
    { label: 'Total Faculty Members', value: faculty.length, icon: UserSquare2, color: 'var(--accent)', desc: 'Admins & Lecturers' },
    { label: 'Active Academic Session', value: activeSession ? activeSession.name : 'None', icon: Calendar, color: '#4cd137', desc: 'Current term' }
  ];

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard state...</div>;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        borderBottom: '4px solid var(--accent)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Welcome, {user?.name}!</h2>
          <p style={{ opacity: 0.85, marginTop: '0.4rem', fontSize: '0.95rem' }}>
            Logged in as <strong style={{ color: 'var(--accent)' }}>{user?.role}</strong> (Dept. of {user?.department})
          </p>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '0.6rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <strong>System Status:</strong> Operational
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="stats-grid">
        {systemStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                backgroundColor: `${stat.color}15`,
                color: stat.color,
                width: '50px',
                height: '50px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {stat.label}
                </p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: '2px 0' }}>
                  {stat.value}
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stat.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout for Analytics Summary & Logs */}
      <div className="dashboard-grid">
        {/* Left Column: Portal Guideline / Quick Actions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
            NIT Rourkela ERP Quick Guide
          </h3>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <p>
              This is the official Marks Management Portal for NIT Rourkela. Features are scoped dynamically based on roles:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem' }}>
              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem' }}>
                <strong style={{ color: 'var(--primary)' }}>System Administrators:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure sessions, manage semester terms, build course catalogs, map faculty coordinates, and audit student registrations.</p>
              </div>
              <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '0.75rem' }}>
                <strong style={{ color: 'var(--accent)' }}>Course Coordinators:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Map specific sub-coordinator teachers, view complete department score cards, enter/edit marks sheets, and extract Excel/PDF grade reports.</p>
              </div>
              <div style={{ borderLeft: '3px solid #4cd137', paddingLeft: '0.75rem' }}>
                <strong style={{ color: '#4cd137' }}>Sub-Coordinators:</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Access mapped subject registers, input student evaluation scores, and review grade statistics for specific student sections.</p>
              </div>
            </div>
            
            <div style={{
              marginTop: 'auto',
              backgroundColor: 'var(--bg-app)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FileSpreadsheet size={32} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Academic Session Status</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Active session is <strong>{activeSession ? activeSession.name : 'Not Configured'}</strong>. All evaluation entries and queries will be registered in this scope.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Logs & Recent Actions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: 'var(--accent)' }} />
            System Audit Trail
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto',
            maxHeight: '320px',
            paddingRight: '0.25rem'
          }}>
            {activities.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No recent audit activity logs.</p>
            ) : (
              activities.map((act) => (
                <div 
                  key={act.id} 
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid var(--border-light)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{act.text}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                    <span>By: {act.user}</span>
                    <span>{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
