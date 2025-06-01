import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserSearch from '../components/UserSearch';
import styles from './Home.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Home() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);

  // Fetch all users, stats, and recents only if logged in
  useEffect(() => {
    if (!user) return;
    async function fetchAll() {
      // All users
      const usersRes = await fetch(`${API_URL}/user/search?q=`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usersRes.ok) setUsers(await usersRes.json());

      // Stats summary
      const statsRes = await fetch(`${API_URL}/user/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) setStats(await statsRes.json());

      // Recent tasks
      const tasksRes = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        setRecentTasks(tasks.slice(0, 3));
      }

      // Recent posts
      const postsRes = await fetch(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (postsRes.ok) {
        const posts = await postsRes.json();
        setRecentPosts(posts.slice(0, 3));
      }

      // Recent files
      const filesRes = await fetch(`${API_URL}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (filesRes.ok) {
        const files = await filesRes.json();
        setRecentFiles(files.slice(0, 3));
      }
    }
    fetchAll();
  }, [user, token]);

  return (
    <div className={styles.container}>
      <h1>StudyFlow</h1>
      {user ? (
        <>
          <p>Welcome, {user.fullName}!</p>
          {/* Dashboard Stats */}
          <div className={styles.statsSection}>
            <h3>Your Stats</h3>
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{stats.tasks ?? '-'}</div>
                <div className={styles.statLabel}>Tasks</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{stats.posts ?? '-'}</div>
                <div className={styles.statLabel}>Posts</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{stats.files ?? '-'}</div>
                <div className={styles.statLabel}>Files</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{stats.habits ?? '-'}</div>
                <div className={styles.statLabel}>Habits</div>
              </div>
            </div>
          </div>

          {/* Quick Widgets */}
          <div className={styles.widgetsRow}>
            {/* Recent Tasks */}
            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <span>Recent Tasks</span>
                <a href="/tasks">View All</a>
              </div>
              <ul>
                {recentTasks.map(t => (
                  <li key={t._id}>
                    <span>{t.title}</span>
                    {t.completed && <span className={styles.completed}>✓</span>}
                  </li>
                ))}
                {recentTasks.length === 0 && <li>No tasks yet</li>}
              </ul>
            </div>
            {/* Recent Posts */}
            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <span>Recent Posts</span>
                <a href="/feed">View All</a>
              </div>
              <ul>
                {recentPosts.map(p => (
                  <li key={p._id}>{p.content.slice(0, 40)}{p.content.length > 40 && '...'}</li>
                ))}
                {recentPosts.length === 0 && <li>No posts yet</li>}
              </ul>
            </div>
            {/* Recent Files */}
            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <span>Recent Files</span>
                <a href="/files">View All</a>
              </div>
              <ul>
                {recentFiles.map(f => (
                  <li key={f._id}>{f.originalname}</li>
                ))}
                {recentFiles.length === 0 && <li>No files yet</li>}
              </ul>
            </div>
          </div>

          {/* All Users */}
          <div className={styles.usersSection}>
            <h3>All Users</h3>
            <ul className={styles.userList}>
              {users.map(u => (
                <li key={u._id} className={styles.userItem} onClick={() => setSelectedUser(u)}>
                  <img
                    src={u.profilePicture?.startsWith('http') ? u.profilePicture : u.profilePicture ? `${API_URL.replace(/\/api$/, '')}${u.profilePicture}` : '/default-avatar.png'}
                    alt="avatar"
                    className={styles.avatar}
                  />
                  <span className={styles.name}>{u.fullName}</span>
                  <span className={styles.email}>{u.email}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* User Search */}
          <div className={styles.searchSection}>
            <h3>Search Users</h3>
            <UserSearch onSelect={setSelectedUser} />
          </div>

          {/* Selected User Profile and Start Chat */}
          {selectedUser && (
            <div className={styles.profileBox}>
              <h4>{selectedUser.fullName}</h4>
              <img
                src={selectedUser.profilePicture?.startsWith('http') ? selectedUser.profilePicture : selectedUser.profilePicture ? `${API_URL.replace(/\/api$/, '')}${selectedUser.profilePicture}` : '/default-avatar.png'}
                alt="avatar"
                style={{ width: 64, height: 64, borderRadius: '50%' }}
              />
              <p>Email: {selectedUser.email}</p>
              <a
                href={`/messages?user=${selectedUser._id}`}
                className={styles.startChatBtn}
              >
                Start Chat
              </a>
            </div>
          )}
        </>
      ) : (
        <>
          <p>Welcome to StudyFlow! 🚀</p>
          <a href="/register" style={{ color: '#6366f1', fontWeight: 600, marginRight: 12 }}>Create an account</a>
          <a href="/login" style={{ color: '#6366f1', fontWeight: 600, marginRight: 12 }}>Login</a>
          <a href="/forgot-password" style={{ color: '#6366f1', fontWeight: 600 }}>Forgot Password?</a>
        </>
      )}
    </div>
  );
}

export default Home;
