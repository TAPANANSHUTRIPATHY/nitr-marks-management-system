import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Layers, BookOpen, Users, 
  GraduationCap, Award, FileText, History, LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'FACULTY'] },
    // Admin only links
    { path: '/sessions', name: 'Sessions', icon: <Calendar size={20} />, roles: ['ADMIN'] },
    { path: '/semesters', name: 'Semesters', icon: <Layers size={20} />, roles: ['ADMIN'] },
    { path: '/subjects', name: 'Subjects', icon: <BookOpen size={20} />, roles: ['ADMIN'] },
    { path: '/faculty', name: 'Faculty', icon: <Users size={20} />, roles: ['ADMIN'] },
    { path: '/students', name: 'Students', icon: <GraduationCap size={20} />, roles: ['ADMIN'] },
    { path: '/grading', name: 'Grading Scheme', icon: <Award size={20} />, roles: ['ADMIN'] },
    // Faculty / Coordinator links
    { path: '/marks', name: 'Marks Entry', icon: <Award size={20} />, roles: ['FACULTY'] },
    { path: '/reports', name: 'Reports', icon: <FileText size={20} />, roles: ['ADMIN', 'FACULTY'] },
    { path: '/audit', name: 'Audit Logs', icon: <History size={20} />, roles: ['ADMIN'] }
  ];

  const filteredItems = menuItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-badge">NIT</div>
          <span className="logo-text">Rourkela</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign Out">
          <LogOut size={20} />
          <span className="logout-text">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
