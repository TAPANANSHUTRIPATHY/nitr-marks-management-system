import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const AcademicContext = createContext();

export const AcademicProvider = ({ children }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeSession = sessions.find(s => s.isActive) || null;

  const refreshData = async () => {
    setLoading(true);
    try {
      const sess = await api.getSessions();
      const sems = await api.getSemesters();
      const subjs = await api.getSubjects();
      const fac = await api.getFaculty();
      const studs = await api.getStudents();
      const mrks = await api.getAllMarks();
      const acts = await api.getActivities();

      setSessions(sess);
      setSemesters(sems);
      setSubjects(subjs);
      setFaculty(fac);
      setStudents(studs);
      setMarks(mrks);
      setActivities(acts);
    } catch (err) {
      console.error("Error loading academic data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Session Actions
  const saveSession = async (sess) => {
    await api.saveSession(sess);
    await refreshData();
  };
  const deleteSession = async (id) => {
    await api.deleteSession(id);
    await refreshData();
  };
  const setActiveSession = async (id) => {
    await api.setActiveSession(id);
    await refreshData();
  };

  // Semester Actions
  const saveSemester = async (sem) => {
    await api.saveSemester(sem);
    await refreshData();
  };
  const deleteSemester = async (id) => {
    await api.deleteSemester(id);
    await refreshData();
  };

  // Subject Actions
  const saveSubject = async (sub) => {
    await api.saveSubject(sub);
    await refreshData();
  };
  const deleteSubject = async (id) => {
    await api.deleteSubject(id);
    await refreshData();
  };

  // Faculty Actions
  const saveFaculty = async (facMember) => {
    await api.saveFaculty(facMember);
    await refreshData();
  };
  const deleteFaculty = async (id) => {
    await api.deleteFaculty(id);
    await refreshData();
  };

  // Student Actions
  const saveStudent = async (stud) => {
    await api.saveStudent(stud);
    await refreshData();
  };
  const deleteStudent = async (rollNumber) => {
    await api.deleteStudent(rollNumber);
    await refreshData();
  };

  // Marks Actions
  const saveMarks = async (subjectCode, updatedMarks) => {
    const facultyName = user ? user.name : 'Unknown Faculty';
    await api.saveMarks(subjectCode, updatedMarks, facultyName);
    await refreshData();
  };

  const value = {
    sessions,
    semesters,
    subjects,
    faculty,
    students,
    marks,
    activities,
    activeSession,
    loading,
    refreshData,
    saveSession,
    deleteSession,
    setActiveSession,
    saveSemester,
    deleteSemester,
    saveSubject,
    deleteSubject,
    saveFaculty,
    deleteFaculty,
    saveStudent,
    deleteStudent,
    saveMarks
  };

  return (
    <AcademicContext.Provider value={value}>
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => useContext(AcademicContext);
