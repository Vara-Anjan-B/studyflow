import React, { useRef, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './Layout.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from './NotificationBell';
import NotificationDropdown from './NotificationDropdown';
import { NotificationProvider } from '../contexts/NotificationContext';
import Footer from './Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace(/\/api$/, '');

function Layout() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const moreBtnRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Fetch notification count
  useEffect(() => {
    if (user && notifOpen) {
      fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(n => setNotifCount(n.length));
    }
  }, [user, notifOpen, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Dropdown keyboard navigation
  const handleMoreKeyDown = (e) => {
    if (!moreOpen && (e.key === 'Enter' || e.key === ' ')) {
      setMoreOpen(true);
      setTimeout(() => {
        moreMenuRef.current?.querySelector('a,button')?.focus();
      }, 10);
      e.preventDefault();
    } else if (moreOpen) {
      const items = Array.from(moreMenuRef.current.querySelectorAll('a,button'));
      const idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        items[(idx + 1) % items.length]?.focus();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        items[(idx - 1 + items.length) % items.length]?.focus();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setMoreOpen(false);
        moreBtnRef.current?.focus();
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    function handleClick(e) {
      if (
        moreOpen &&
        !e.target.closest(`.${styles.moreDropdown}`) &&
        !e.target.closest(`.${styles.moreBtn}`)
      ) {
        setMoreOpen(false);
      }
      if (
        notifOpen &&
        !e.target.closest(`.${styles.notifDropdown}`) &&
        !e.target.closest(`.${styles.notifBtn}`)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen, notifOpen]);

  // Helper to get the correct avatar URL
  const getAvatar = () => {
    if (!user?.profilePicture) return '/default-avatar.png';
    if (user.profilePicture.startsWith('/default-avatar')) return user.profilePicture;
    if (user.profilePicture.startsWith('http')) return user.profilePicture;
    return `${BACKEND_URL}${user.profilePicture}`;
  };

  // Close dropdown when a link is clicked
  const handleDropdownLinkClick = () => {
    setMoreOpen(false);
  };

  return (
    <NotificationProvider>
      <div className={styles.container}>
        <nav className={styles.navbar}>
          <h1 className={styles.logo}>StudyFlow</h1>
          <ul className={styles.navLinks}>
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
            </li>
            {user && (
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>Dashboard</NavLink>
              </li>
            )}
            {user && (
              <li>
                <NavLink to="/feed" className={({ isActive }) => isActive ? styles.active : ''}>Feed</NavLink>
              </li>
            )}
            {user && (
              <li>
                <NavLink to="/messages" className={({ isActive }) => isActive ? styles.active : ''}>Messages</NavLink>
              </li>
            )}
            {user && (
              <li>
                <NavLink to="/settings" className={({ isActive }) => isActive ? styles.active : ''}>Settings</NavLink>
              </li>
            )}
            {user && (
              <li className={styles.moreDropdown} style={{ position: 'relative' }}>
                <button
                  className={styles.moreBtn}
                  ref={moreBtnRef}
                  aria-haspopup="true"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((open) => !open)}
                  onKeyDown={handleMoreKeyDown}
                  tabIndex={0}
                >
                  More ▾
                </button>
                {moreOpen && (
                  <ul
                    className={styles.dropdownMenu}
                    ref={moreMenuRef}
                    tabIndex={-1}
                    onKeyDown={handleMoreKeyDown}
                  >
                    <li>
                      <NavLink to="/tasks" tabIndex={0} onClick={handleDropdownLinkClick}>Tasks</NavLink>
                    </li>
                    <li>
                      <NavLink to="/files" tabIndex={0} onClick={handleDropdownLinkClick}>Files</NavLink>
                    </li>
                    <li>
                      <NavLink to="/activity" tabIndex={0} onClick={handleDropdownLinkClick}>Activity</NavLink>
                    </li>
                    <li>
                      <NavLink to="/groupchat" tabIndex={0} onClick={handleDropdownLinkClick}>Group Chat</NavLink>
                    </li>
                    <li>
                      <NavLink to="/profile" tabIndex={0} onClick={handleDropdownLinkClick}>Profile</NavLink>
                    </li>
                    <li>
                      <NavLink to="/login" tabIndex={0} onClick={handleDropdownLinkClick}>Logout</NavLink>
                    </li>
                  </ul>
                )}
              </li>
            )}
            {!user && (
              <>
                <li>
                  <NavLink to="/register" className={({ isActive }) => isActive ? styles.active : ''}>Register</NavLink>
                </li>
                <li>
                  <NavLink to="/login" className={({ isActive }) => isActive ? styles.active : ''}>Login</NavLink>
                </li>
              </>
            )}
            {user && (
              <li className={styles.notifDropdown}>
                <button
                  className={`${styles.notifBtn} ${notifOpen ? styles.active : ''}`}
                  onClick={() => setNotifOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={notifOpen}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <NotificationBell count={notifCount} />
                </button>
                <NotificationDropdown
                  open={notifOpen}
                  onClose={() => setNotifOpen(false)}
                  onDelete={() => {
                    fetch(`${API_URL}/notifications`, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                      .then(res => res.json())
                      .then(n => setNotifCount(n.length));
                  }}
                />
              </li>
            )}
            <li>
              <button
                className={styles.themeToggleBtn}
                onClick={handleThemeToggle}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
            </li>
            {user && (
              <li>
                <img
                  src={getAvatar()}
                  alt="avatar"
                  className={styles.navAvatar}
                  onClick={() => navigate('/profile')}
                  title={user.fullName}
                  style={{ marginLeft: 8, cursor: 'pointer' }}
                />
              </li>
            )}
            {user && (
              <li>
                <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </nav>
        <main className={styles.mainContent}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </NotificationProvider>
  );
}

export default Layout;
