import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });
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
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Registration failed.');
      else {
        setMsg(data.message || 'Registration successful!');
        setTimeout(() => navigate('/login'), 2000);
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
        <h2>Create Account</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              minLength={2}
              maxLength={50}
              required
              autoFocus
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </label>
          {msg && <div className={styles.success}>{msg}</div>}
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.actions}>
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <Link className={styles.switchLink} to="/login">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}

export default Register;
