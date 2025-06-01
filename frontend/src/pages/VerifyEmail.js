import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function VerifyEmail() {
  const { token } = useParams();
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email/${token}`);
        const data = await res.json();
        if (!res.ok) setError(data.message || 'Verification failed.');
        else setMsg(data.message);
      } catch {
        setError('Network error.');
      }
    }
    verify();
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 32px rgba(80,80,200,0.08)', maxWidth: 370 }}>
        <h2>Email Verification</h2>
        {msg && <div style={{ color: '#388e3c', marginBottom: 16 }}>{msg}</div>}
        {error && <div style={{ color: '#d32f2f', marginBottom: 16 }}>{error}</div>}
        <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>Go to Login</Link>
      </div>
    </div>
  );
}

export default VerifyEmail;