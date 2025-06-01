import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // <-- If you have a theme context
import styles from './NotificationDropdown.module.css'; // Use your CSS module

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function NotificationDropdown({ open, onClose, onDelete }) {
  const { token } = useAuth();
  const { theme } = useTheme(); // If you don't have this, remove it and see below
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (open) {
      fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setNotifications);
    }
  }, [open, token]);

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(notifications.filter(n => n._id !== id));
    if (onDelete) onDelete();
  };

  if (!open) return null;

  return (
    <div
      className={styles.dropdown}
      data-theme={theme} // Ensures theme CSS applies even if rendered in a portal
      tabIndex={-1}
      role="menu"
      aria-label="Notifications"
    >
      <div className={styles.header}>
        <span>Notifications</span>
        {/* Optionally add a mark all as read button here */}
      </div>
      {notifications.length === 0 ? (
        <div className={styles.empty}>No notifications</div>
      ) : (
        <ul className={styles.list}>
          {notifications.map(n => (
            <li key={n._id} className={styles.unread}>
              <span style={{ flex: 1 }}>{n.message}</span>
              <button
                onClick={() => handleDelete(n._id)}
                className={styles.deleteBtn}
                title="Delete notification"
                aria-label="Delete notification"
              >✖</button>
            </li>
          ))}
        </ul>
      )}
      <button className={styles.closeBtn} onClick={onClose}>Close</button>
    </div>
  );
}

export default NotificationDropdown;
