import React, { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, Calendar, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import '../styles/pages/Dashboard.css';

const StatCard = ({ icon, label, value, sub, colorClass }) => (
  <div className={`stat-card glass-card ${colorClass}`}>
    <div className="stat-icon-wrap">
      {icon}
    </div>
    <div className="stat-body">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    sessions: null, semesters: null, subjects: null,
    faculty: null, students: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      setLoading(false);
      return;
    }
    const fetchStats = async () => {
      try {
        const [sessRes, semRes, subjRes, facRes, stuRes] = await Promise.allSettled([
          axiosClient.get('/api/sessions'),
          axiosClient.get('/api/semesters'),
          axiosClient.get('/api/subjects'),
          axiosClient.get('/api/faculty'),
          axiosClient.get('/api/students'),
        ]);
        setStats({
          sessions: sessRes.status === 'fulfilled' ? sessRes.value.data?.length : '?',
          semesters: semRes.status === 'fulfilled' ? semRes.value.data?.length : '?',
          subjects: subjRes.status === 'fulfilled' ? subjRes.value.data?.length : '?',
          faculty: facRes.status === 'fulfilled' ? facRes.value.data?.length : '?',
          students: stuRes.status === 'fulfilled' ? stuRes.value.data?.length : '?',
        });
      } catch (e) {
        console.error('Failed to fetch stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAdmin]);

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-greeting">
        <h1>{greetingTime()}, {user?.name?.split(' ')[0]}!</h1>
        <p>Welcome to the NIT Rourkela Marks Management Portal.</p>
      </div>

      {isAdmin() && (
        <>
          <h2 className="section-title">Academic Overview</h2>
          <div className="stats-grid">
            <StatCard
              icon={<Calendar size={24} />}
              label="Academic Sessions"
              value={loading ? '...' : stats.sessions}
              colorClass="stat-blue"
            />
            <StatCard
              icon={<BookOpen size={24} />}
              label="Subjects"
              value={loading ? '...' : stats.subjects}
              colorClass="stat-teal"
            />
            <StatCard
              icon={<Users size={24} />}
              label="Faculty Members"
              value={loading ? '...' : stats.faculty}
              colorClass="stat-gold"
            />
            <StatCard
              icon={<GraduationCap size={24} />}
              label="Students"
              value={loading ? '...' : stats.students}
              colorClass="stat-green"
            />
          </div>
        </>
      )}

      <div className="dashboard-info-cards">
        <div className="info-card glass-card">
          <div className="info-card-header">
            <Award size={20} />
            <h3>Grading Scale (NIT Rourkela)</h3>
          </div>
          <div className="grade-scale-grid">
            {[
              { g: 'O', pct: '90–100%', gp: 10, cls: 'grade-o' },
              { g: 'E', pct: '80–89%',  gp: 9,  cls: 'grade-e' },
              { g: 'A', pct: '70–79%',  gp: 8,  cls: 'grade-a' },
              { g: 'B', pct: '60–69%',  gp: 7,  cls: 'grade-b' },
              { g: 'C', pct: '50–59%',  gp: 6,  cls: 'grade-c' },
              { g: 'D', pct: '40–49%',  gp: 5,  cls: 'grade-d' },
              { g: 'F', pct: '0–39%',   gp: 0,  cls: 'grade-f' },
            ].map(item => (
              <div key={item.g} className={`grade-row grade-row-${item.cls}`}>
                <span className={`grade-badge grade-badge-${item.cls}`}>{item.g}</span>
                <span className="grade-pct">{item.pct}</span>
                <span className="grade-gp">{item.gp}.0</span>
              </div>
            ))}
          </div>
        </div>

        <div className="info-card glass-card">
          <div className="info-card-header">
            <TrendingUp size={20} />
            <h3>Quick Guide</h3>
          </div>
          <ul className="quick-guide-list">
            {isAdmin() ? (
              <>
                <li><span className="step-num">1</span> Create an <strong>Academic Session</strong> (e.g., 2024-25)</li>
                <li><span className="step-num">2</span> Add <strong>Semesters</strong> under the session</li>
                <li><span className="step-num">3</span> Create <strong>Subjects</strong> with marks configuration</li>
                <li><span className="step-num">4</span> Map subjects to semesters</li>
                <li><span className="step-num">5</span> Add <strong>Faculty</strong> and assign as Coordinators</li>
                <li><span className="step-num">6</span> Import <strong>Students</strong> via CSV</li>
                <li><span className="step-num">7</span> Faculty enters marks in the <strong>Marks Entry</strong> grid</li>
              </>
            ) : (
              <>
                <li><span className="step-num">1</span> Go to <strong>Marks Entry</strong> to enter student marks</li>
                <li><span className="step-num">2</span> Marks are auto-saved as <strong>Draft</strong></li>
                <li><span className="step-num">3</span> <strong>Submit</strong> marks for coordinator review</li>
                <li><span className="step-num">4</span> <strong>Lock</strong> marks to make them final</li>
                <li><span className="step-num">5</span> View <strong>Reports</strong> and grade distributions</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
