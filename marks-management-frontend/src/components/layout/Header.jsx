import React from 'react';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/Header.css';

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={20} />
        </button>
        <div className="header-breadcrumbs">
          <span className="breadcrumb-main">NIT Rourkela</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-sub">Marks Management</span>
        </div>
      </div>

      <div className="header-right">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="header-divider"></div>

        <div className="header-user">
          <div className="user-details">
            <span className="user-profile-name">{user?.name}</span>
            <span className="user-profile-email">{user?.email}</span>
          </div>
          <button className="header-logout-btn" onClick={logout} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
