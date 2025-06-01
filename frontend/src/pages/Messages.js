import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Messages.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Messages() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgContent, setMsgContent] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch(`${API_URL}/messages/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(await res.json());
    }
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (!selected) return;
    async function fetchMessages() {
      const res = await fetch(`${API_URL}/messages/with/${selected._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMessages(await res.json());
    }
    fetchMessages();
    // Optionally, poll every 5s for new messages:
    // const interval = setInterval(fetchMessages, 5000);
    // return () => clearInterval(interval);
  }, [selected, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    try {
      const res = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to: selected._id, content: msgContent }),
      });
      if (res.ok) {
        setMsgContent('');
        // Refresh messages
        const msgRes = await fetch(`${API_URL}/messages/with/${selected._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (msgRes.ok) setMessages(await msgRes.json());
      } else {
        setError('Could not send message.');
      }
    } catch {
      setError('Network error.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Messages</h2>
        <div className={styles.content}>
          <div className={styles.userList}>
            <h3>Users</h3>
            <ul>
              {users.map(u => (
                <li
                  key={u._id}
                  className={selected && selected._id === u._id ? styles.selectedUser : ''}
                  onClick={() => setSelected(u)}
                >
                  <img
                    src={u.profilePicture?.startsWith('http') ? u.profilePicture : u.profilePicture ? `${API_URL.replace(/\/api$/, '')}${u.profilePicture}` : '/default-avatar.png'}
                    alt="avatar"
                    className={styles.avatar}
                  />
                  <span>{u.fullName}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.chatSection}>
            {selected ? (
              <>
                <div className={styles.chatHeader}>
                  <img
                    src={selected.profilePicture?.startsWith('http') ? selected.profilePicture : selected.profilePicture ? `${API_URL.replace(/\/api$/, '')}${selected.profilePicture}` : '/default-avatar.png'}
                    alt="avatar"
                    className={styles.avatar}
                  />
                  <span>{selected.fullName}</span>
                </div>
                <div className={styles.messagesList}>
                  {messages.map(m => (
                    <div
                      key={m._id}
                      className={m.from === user.id ? styles.myMsg : styles.theirMsg}
                    >
                      <span>{m.content}</span>
                      <span className={styles.msgTime}>{new Date(m.createdAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form className={styles.msgForm} onSubmit={handleSend}>
                  <input
                    type="text"
                    value={msgContent}
                    onChange={e => setMsgContent(e.target.value)}
                    placeholder="Type a message..."
                    required
                  />
                  <button type="submit">Send</button>
                </form>
                {error && <div className={styles.error}>{error}</div>}
              </>
            ) : (
              <div className={styles.noChat}>Select a user to start chatting.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;