import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Dashboard.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({});
  const [habits, setHabits] = useState([]);
  const [habitName, setHabitName] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch(`${API_URL}/user/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStats(await res.json());
    }
    async function fetchHabits() {
      const res = await fetch(`${API_URL}/habits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHabits(await res.json());
    }
    fetchStats();
    fetchHabits();
  }, [token]);

  const handleHabitAdd = async e => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: habitName }),
      });
      if (res.ok) {
        setHabitName('');
        setMsg('Habit added!');
        const habitsRes = await fetch(`${API_URL}/habits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (habitsRes.ok) setHabits(await habitsRes.json());
      } else {
        setError('Could not add habit.');
      }
    } catch {
      setError('Network error.');
    }
  };

  const handleHabitComplete = async id => {
    await fetch(`${API_URL}/habits/${id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const habitsRes = await fetch(`${API_URL}/habits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (habitsRes.ok) setHabits(await habitsRes.json());
  };

  const handleHabitDelete = async id => {
    await fetch(`${API_URL}/habits/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const habitsRes = await fetch(`${API_URL}/habits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (habitsRes.ok) setHabits(await habitsRes.json());
  };

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardCard}>
        <h2>Welcome{user?.fullName ? `, ${user.fullName}` : ''}!</h2>
        <div className={styles.stats}>
          <div><span className={styles.statLabel}>Tasks:</span> {stats.tasks ?? '-'}</div>
          <div><span className={styles.statLabel}>Posts:</span> {stats.posts ?? '-'}</div>
          <div><span className={styles.statLabel}>Files:</span> {stats.files ?? '-'}</div>
          <div><span className={styles.statLabel}>Habits:</span> {stats.habits ?? '-'}</div>
        </div>
        <div className={styles.habitsSection}>
          <h3>Your Habits</h3>
          <form className={styles.habitForm} onSubmit={handleHabitAdd}>
            <input
              type="text"
              value={habitName}
              onChange={e => setHabitName(e.target.value)}
              placeholder="New habit..."
              required
              minLength={2}
            />
            <button type="submit">Add</button>
          </form>
          <ul className={styles.habitList}>
            {habits.map(habit => {
              const completedToday = habit.completedDates.some(d => new Date(d).getTime() === today.getTime());
              return (
                <li key={habit._id} className={completedToday ? styles.habitDone : ''}>
                  <span>{habit.name}</span>
                  <button onClick={() => handleHabitComplete(habit._id)} disabled={completedToday}>
                    {completedToday ? 'Done Today' : 'Mark Done'}
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleHabitDelete(habit._id)}>
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        {msg && <div className={styles.success}>{msg}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

export default Dashboard;
