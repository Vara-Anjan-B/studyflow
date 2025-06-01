import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ResetPassword.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Error');
      else {
        setMsg(data.message);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch {
      setError('Network error.');
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {msg && <div className={styles.success}>{msg}</div>}
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;