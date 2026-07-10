import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import './styles/globals.css';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sessions = lazy(() => import('./pages/admin/Sessions'));
const Semesters = lazy(() => import('./pages/admin/Semesters'));
const Subjects = lazy(() => import('./pages/admin/Subjects'));
const Faculty = lazy(() => import('./pages/admin/Faculty'));
const Students = lazy(() => import('./pages/admin/Students'));
const GradingScheme = lazy(() => import('./pages/admin/GradingScheme'));
const MarksEntry = lazy(() => import('./pages/marks/MarksEntry'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const AuditLogs = lazy(() => import('./pages/audit/AuditLogs'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '16px', color: 'var(--text-muted)' }}>
    <div className="loader-spinner"></div>
    <span>Loading...</span>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/semesters" element={<Semesters />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/faculty" element={<Faculty />} />
                <Route path="/students" element={<Students />} />
                <Route path="/grading" element={<GradingScheme />} />
                <Route path="/marks" element={<MarksEntry />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/audit" element={<AuditLogs />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
