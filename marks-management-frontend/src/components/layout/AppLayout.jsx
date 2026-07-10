import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/AppLayout.css';

const AppLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="app-loader">
        <div className="loader-spinner"></div>
        <p>Loading NIT Rourkela Marks Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
