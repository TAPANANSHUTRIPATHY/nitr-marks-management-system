import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Layers, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Edit3, 
  ClipboardList, 
  BarChart3, 
  UserCog 
} from 'lucide-react';

export default function Sidebar({ isOpen, activeTab, onSelectTab }) {
  const { user, isAdmin, isCoordinator, isSubCoordinator } = useAuth();

  if (!user) return null;

  // Sidebar Menu Configuration based on role permissions
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Course Coordinator', 'Sub-Coordinator'] },
    // Admin only
    { id: 'sessions', label: 'Academic Sessions', icon: Calendar, roles: ['Admin'] },
    { id: 'semesters', label: 'Semesters', icon: Layers, roles: ['Admin'] },
    { id: 'subjects', label: 'Subjects Catalog', icon: BookOpen, roles: ['Admin'] },
    { id: 'faculty', label: 'Faculty Roster', icon: Users, roles: ['Admin'] },
    { id: 'students', label: 'Student Directory', icon: GraduationCap, roles: ['Admin'] },
    // Coordinator / Sub-Coordinator
    { id: 'marks-entry', label: 'Marks Entry Sheet', icon: Edit3, roles: ['Course Coordinator', 'Sub-Coordinator'] },
    // All (with different access/filters)
    { id: 'marks-mgmt', label: 'Marks Logs', icon: ClipboardList, roles: ['Admin', 'Course Coordinator', 'Sub-Coordinator'] },
    { id: 'reports', label: 'Performance Analytics', icon: BarChart3, roles: ['Admin', 'Course Coordinator', 'Sub-Coordinator'] },
    { id: 'profile', label: 'My Profile', icon: UserCog, roles: ['Admin', 'Course Coordinator', 'Sub-Coordinator'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside style={{
      width: isOpen ? '260px' : '0px',
      backgroundColor: '#0a1d37', // Deep slate navy
      color: '#ffffff',
      height: 'calc(100vh - 70px)',
      position: 'sticky',
      top: '70px',
      transition: 'width var(--transition-normal)',
      overflowY: 'auto',
      overflowX: 'hidden',
      borderRight: '1px solid #102a43',
      zIndex: 90,
      flexShrink: 0
    }} className="app-sidebar">
      <div style={{ padding: '1.25rem 0' }}>
        {/* Role Section Title */}
        {isOpen && (
          <div style={{
            padding: '0 1.25rem 0.75rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1rem'
          }}>
            <p style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--accent)',
              letterSpacing: '1.5px'
            }}>Role Access Dashboard</p>
            <p style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              marginTop: '2px'
            }}>{user.role}</p>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%',
                  padding: '0.85rem 1.25rem',
                  border: 'none',
                  background: isActive ? 'linear-gradient(90deg, rgba(229, 142, 38, 0.15) 0%, rgba(10, 44, 92, 0) 100%)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.75)',
                  borderLeft: isActive ? '4px solid var(--accent)' : '4px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span style={{
                  whiteSpace: 'nowrap',
                  opacity: isOpen ? 1 : 0,
                  transition: 'opacity var(--transition-fast)'
                }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
