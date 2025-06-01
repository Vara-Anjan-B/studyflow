import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import styles from './GroupChat.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

function GroupChat() {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgContent, setMsgContent] = useState('');
  const [roomName, setRoomName] = useState('');
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch rooms and users on mount
  useEffect(() => {
    async function fetchRooms() {
      const res = await fetch(`${API_URL}/chatrooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRooms(await res.json());
    }
    async function fetchUsers() {
      const res = await fetch(`${API_URL}/messages/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAllUsers(await res.json());
    }
    fetchRooms();
    fetchUsers();
  }, [token]);

  // Socket.IO setup
  useEffect(() => {
    if (!selectedRoom) return;
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('joinRoom', selectedRoom._id);

    socketRef.current.on('newGroupMessage', msg => {
      setMessages(msgs => [...msgs, msg]);
    });

    return () => {
      socketRef.current.emit('leaveRoom', selectedRoom._id);
      socketRef.current.disconnect();
    };
  }, [selectedRoom]);

  // Fetch messages for selected room
  useEffect(() => {
    if (!selectedRoom) return;
    async function fetchMessages() {
      const res = await fetch(`${API_URL}/chatrooms/${selectedRoom._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMessages(await res.json());
    }
    fetchMessages();
  }, [selectedRoom, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = e => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    socketRef.current.emit('sendGroupMessage', {
      roomId: selectedRoom._id,
      from: user.id,
      content: msgContent
    });
    setMsgContent('');
  };

  const handleCreateRoom = async e => {
    e.preventDefault();
    if (!roomName.trim() || members.length === 0) return;
    const res = await fetch(`${API_URL}/chatrooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: roomName, memberIds: members.map(u => u._id) }),
    });
    if (res.ok) {
      setRoomName('');
      setMembers([]);
      const roomsRes = await fetch(`${API_URL}/chatrooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (roomsRes.ok) setRooms(await roomsRes.json());
    }
  };

  const handleMemberToggle = userObj => {
    setMembers(members =>
      members.some(u => u._id === userObj._id)
        ? members.filter(u => u._id !== userObj._id)
        : [...members, userObj]
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Group Chat Rooms</h2>
        <div className={styles.roomsSection}>
          <h3>Your Rooms</h3>
          <ul>
            {rooms.map(r => (
              <li
                key={r._id}
                className={selectedRoom && selectedRoom._id === r._id ? styles.selectedRoom : ''}
                onClick={() => setSelectedRoom(r)}
              >
                {r.name}
              </li>
            ))}
          </ul>
          <form className={styles.createRoomForm} onSubmit={handleCreateRoom}>
            <input
              type="text"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="New room name"
              required
            />
            <div className={styles.membersList}>
              {allUsers.map(u => (
                <label key={u._id} className={styles.memberLabel}>
                  <input
                    type="checkbox"
                    checked={members.some(m => m._id === u._id)}
                    onChange={() => handleMemberToggle(u)}
                  />
                  {u.fullName}
                </label>
              ))}
            </div>
            <button type="submit">Create Room</button>
          </form>
        </div>
        <div className={styles.chatSection}>
          {selectedRoom ? (
            <>
              <div className={styles.chatHeader}>
                <span>{selectedRoom.name}</span>
              </div>
              <div className={styles.messagesList}>
                {messages.map(m => (
                  <div
                    key={m._id}
                    className={m.from._id === user.id ? styles.myMsg : styles.theirMsg}
                  >
                    <span className={styles.msgAuthor}>{m.from.fullName}:</span>
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
            </>
          ) : (
            <div className={styles.noChat}>Select a room to start chatting.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupChat;
