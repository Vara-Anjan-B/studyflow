import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications when token changes
  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setNotifications(await res.json());
        }
      } catch {
        // Optionally handle error
      }
    }
    fetchNotifications();
    // Optionally, add polling here:
    // const interval = setInterval(fetchNotifications, 30000);
    // return () => clearInterval(interval);
  }, [token]);

  // Mark a single notification as read
  const markAsRead = async id => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(notifications =>
      notifications.map(n => (n._id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
