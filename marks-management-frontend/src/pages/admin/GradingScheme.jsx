import React, { useState, useEffect } from 'react';
import { Award, Pencil, Check, X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import '../../styles/pages/AdminPage.css';
import '../../styles/pages/GradingScheme.css';

const GradingScheme = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [boundaries, setBoundaries] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSchemes = async () => {
    try {
      const res = await axiosClient.get('/api/grading/schemes');
      setSchemes(res.data);
      if (res.data.length > 0) {
        const defaultScheme = res.data.find(s => s.isDefault) || res.data[0];
        setSelectedScheme(defaultScheme);
        fetchBoundaries(defaultScheme.id);
      }
    } catch {
      setError('Failed to load grading schemes');
    } finally {
      setLoading(false);
    }
  };

  const fetchBoundaries = async (schemeId) => {
    try {
      const res = await axiosClient.get(`/api/grading/schemes/${schemeId}/boundaries`);
      setBoundaries(res.data);
    } catch {
      setError('Failed to load boundaries');
    }
  };

  useEffect(() => { fetchSchemes(); }, []);

  const handleBoundaryChange = (idx, field, value) => {
    setBoundaries(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await axiosClient.put(`/api/grading/schemes/${selectedScheme.id}/boundaries`, boundaries);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save boundaries');
    } finally {
      setSaving(false);
    }
  };

  const gradeColors = { O: 'grade-o', E: 'grade-e', A: 'grade-a', B: 'grade-b', C: 'grade-c', D: 'grade-d', F: 'grade-f' };

  if (loading) return <div className="loading-state"><div className="loader-spinner"></div><p>Loading grading scheme...</p></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Grading Scheme</h1>
          <p className="page-desc">Configure grade boundaries for automatic grade computation</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <Pencil size={18} /> Edit Boundaries
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost" onClick={() => { setEditing(false); fetchBoundaries(selectedScheme.id); }}>
              <X size={18} /> Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="btn-spinner"></span> : <Check size={18} />} Save Changes
            </button>
          </div>
        )}
      </div>

      {selectedScheme && (
        <div className="scheme-name-card glass-card">
          <Award size={20} />
          <div>
            <div className="scheme-name">{selectedScheme.name}</div>
            {selectedScheme.isDefault && <span className="status-badge status-active">Default Scheme</span>}
          </div>
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      <div className="boundaries-table glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Description</th>
              <th>Min %</th>
              <th>Max %</th>
              <th>Grade Point</th>
            </tr>
          </thead>
          <tbody>
            {boundaries.map((b, i) => (
              <tr key={b.id || i}>
                <td>
                  <span className={`grade-badge grade-badge-${gradeColors[b.grade] || ''}`}>
                    {b.grade}
                  </span>
                </td>
                <td className="cell-primary">
                  {b.grade === 'O' ? 'Outstanding' : b.grade === 'E' ? 'Excellent' :
                   b.grade === 'A' ? 'Very Good' : b.grade === 'B' ? 'Good' :
                   b.grade === 'C' ? 'Average' : b.grade === 'D' ? 'Below Average' : 'Fail'}
                </td>
                <td>
                  {editing ? (
                    <input className="form-input boundary-input" type="number" min="0" max="100"
                      value={b.minPercentage} onChange={e => handleBoundaryChange(i, 'minPercentage', parseInt(e.target.value))} />
                  ) : `${b.minPercentage}%`}
                </td>
                <td>
                  {editing ? (
                    <input className="form-input boundary-input" type="number" min="0" max="100"
                      value={b.maxPercentage} onChange={e => handleBoundaryChange(i, 'maxPercentage', parseInt(e.target.value))} />
                  ) : `${b.maxPercentage}%`}
                </td>
                <td className="cell-primary">{b.gradePoint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradingScheme;
