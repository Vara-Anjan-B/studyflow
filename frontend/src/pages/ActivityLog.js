import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './ActivityLog.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const actionLabels = {
  login: 'Logged in',
  register: 'Registered account',
  reset_password: 'Reset password',
  update_profile: 'Updated profile',
  // add more as needed
};

function ActivityLog() {
  const { token } = useAuth();
  const [log, setLog] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLog() {
      try {
        const res = await fetch(`${API_URL}/user/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setLog(data);
        else setError(data.message || 'Failed to load activity.');
      } catch {
        setError('Network error.');
      }
    }
    fetchLog();
  }, [token]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Recent Activity</h2>
        {error && <div className={styles.error}>{error}</div>}
        <ul className={styles.logList}>
          {log.length === 0 && <li>No activity yet.</li>}
          {log.map((item, idx) => (
            <li key={idx}>
              <span className={styles.action}>{actionLabels[item.action] || item.action}</span>
              <span className={styles.time}>{new Date(item.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ActivityLog;