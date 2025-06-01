import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Request failed.');
      else setMsg(data.message || 'Check your email for a reset link.');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Forgot Password</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setMsg(''); setError(''); }}
              required
              autoFocus
            />
          </label>
          {msg && <div className={styles.success}>{msg}</div>}
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.actions}>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        <Link className={styles.switchLink} to="/login">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
