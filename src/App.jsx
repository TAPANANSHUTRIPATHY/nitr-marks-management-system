import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademicProvider } from './context/AcademicContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SessionManagement from './pages/SessionManagement';
import SemesterManagement from './pages/SemesterManagement';
import SubjectManagement from './pages/SubjectManagement';
import FacultyManagement from './pages/FacultyManagement';
import StudentManagement from './pages/StudentManagement';
import MarksEntry from './pages/MarksEntry';
import MarksManagement from './pages/MarksManagement';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!isAuthenticated) {
    return <Login />;
  }

  // Enforce role checks in routing dynamically (in case of cached tabs)
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sessions':
        return user.role === 'Admin' ? <SessionManagement /> : <Dashboard />;
      case 'semesters':
        return user.role === 'Admin' ? <SemesterManagement /> : <Dashboard />;
      case 'subjects':
        return user.role === 'Admin' ? <SubjectManagement /> : <Dashboard />;
      case 'faculty':
        return user.role === 'Admin' ? <FacultyManagement /> : <Dashboard />;
      case 'students':
        return user.role === 'Admin' ? <StudentManagement /> : <Dashboard />;
      case 'marks-entry':
        return (user.role === 'Course Coordinator' || user.role === 'Sub-Coordinator') ? <MarksEntry /> : <Dashboard />;
      case 'marks-mgmt':
        return <MarksManagement />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AcademicProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar onToggleSidebar={toggleSidebar} />
        
        <div className="app-container" style={{ flex: 1, display: 'flex' }}>
          <Sidebar 
            isOpen={sidebarOpen} 
            activeTab={activeTab} 
            onSelectTab={(tabId) => {
              setActiveTab(tabId);
              // Auto-collapse sidebar on mobile screen once selected
              if (window.innerWidth <= 768) {
                setSidebarOpen(false);
              }
            }} 
          />
          
          <main className="main-content" style={{ flex: 1, minWidth: 0 }}>
            <div className="content-wrapper">
              {renderActivePage()}
            </div>
          </main>
        </div>
      </div>
    </AcademicProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
