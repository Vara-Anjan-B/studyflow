import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminPanel.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminPanel() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
        else setError(data.message || 'Failed to load users.');
      } catch {
        setError('Network error.');
      }
    }
    if (user?.role === 'admin') fetchUsers();
  }, [token, user]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/user/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(users => users.filter(u => u._id !== id));
      else alert('Failed to delete user.');
    } catch {
      alert('Network error.');
    }
  };

  if (user?.role !== 'admin') return <div className={styles.container}>Not authorized.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Admin Panel</h2>
        {error && <div className={styles.error}>{error}</div>}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.role !== 'admin' && (
                    <button className={styles.deleteBtn} onClick={() => handleDelete(u._id)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel;