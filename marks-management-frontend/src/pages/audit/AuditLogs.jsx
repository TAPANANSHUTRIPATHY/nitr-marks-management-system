import React, { useState, useEffect } from 'react';
import { History, Shield } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import '../../styles/pages/AdminPage.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosClient.get('/api/audit');
        setLogs(res.data);
      } catch (err) {
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Audit Logs</h1>
          <p className="page-desc">Trace history of database transactions and security audits</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="loader-spinner"></div>
          <p>Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state glass-card">
          <History size={48} />
          <h3>No Logs Record</h3>
          <p>No audit trail records found in database.</p>
        </div>
      ) : (
        <div className="table-wrapper glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User ID</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Details (JSON)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="cell-primary">{formatDate(log.timestamp)}</td>
                  <td><code className="code-tag">{log.userId || 'System'}</code></td>
                  <td>
                    <span className={`status-badge ${
                      log.action === 'CREATE' ? 'status-active' :
                      log.action === 'DELETE' ? 'status-inactive' : 'status-submitted'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="cell-primary">{log.entity}</td>
                  <td><code className="code-tag">{log.entityId}</code></td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {JSON.stringify({ previous: log.previousValues, new: log.newValues })}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
