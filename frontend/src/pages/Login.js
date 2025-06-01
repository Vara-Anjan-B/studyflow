import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Login.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg('');
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Login failed.');
      else {
        setMsg('Login successful!');
        login(data.user, data.token);
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Login</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <div className={styles.forgotLink}>
            <Link to="/forgot-password">Don't remember the password? Forgot password</Link>
          </div>
          {msg && <div className={styles.success}>{msg}</div>}
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.actions}>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <Link className={styles.switchLink} to="/register">
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
}

export default Login;
