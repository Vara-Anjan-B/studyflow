import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Profile.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Profile() {
  const { token, login } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    social: { twitter: '', linkedin: '' },
    notificationPrefs: {},
  });
  const [profilePicture, setProfilePicture] = useState('');
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  // Helper to always build the correct avatar URL
  const getAvatar = (pic) => {
    if (!pic) return 'http://localhost:5000/uploads/123.jpg';
    if (pic.startsWith('http')) return pic;
    return `http://localhost:5000${pic}`;
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setForm({
            fullName: data.fullName || '',
            bio: data.bio || '',
            social: data.social || { twitter: '', linkedin: '' },
            notificationPrefs: data.notificationPrefs || {},
          });
          setProfilePicture(data.profilePicture || '');
        }
      } catch {
        setError('Failed to load profile.');
      }
    }
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg('');
    setError('');
  };

  const handleSocialChange = (e) => {
    setForm({
      ...form,
      social: { ...form.social, [e.target.name]: e.target.value },
    });
    setMsg('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Update failed.');
      else {
        setMsg('Profile updated!');
        login(data, token);
      }
    } catch {
      setError('Network error.');
    }
  };

  // Handle profile picture upload
  const handlePictureChange = async (e) => {
    setError('');
    setMsg('');
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      const res = await fetch(`${API_URL}/user/profile/picture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Upload failed.');
      else {
        setProfilePicture(data.profilePicture);
        setMsg('Profile picture updated!');
      }
    } catch {
      setError('Network error.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileBox}>
        <h2>Your Profile</h2>
        <div className={styles.avatarSection}>
          <img
            src={getAvatar(profilePicture)}
            alt="Profile"
            className={styles.avatar}
            onClick={() => editing && fileInputRef.current.click()}
            style={{ cursor: editing ? 'pointer' : 'default' }}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handlePictureChange}
          />
          <div style={{ fontSize: 12, color: '#6366f1', marginTop: 4 }}>
            {editing ? 'Click to change profile picture' : ''}
          </div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={!editing}
              minLength={2}
              maxLength={50}
              required
            />
          </label>
          <label>
            Bio
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              maxLength={300}
              disabled={!editing}
              rows={3}
            />
          </label>
          <label>
            Twitter
            <input
              type="text"
              name="twitter"
              value={form.social?.twitter || ''}
              onChange={handleSocialChange}
              disabled={!editing}
              placeholder="https://twitter.com/yourhandle"
            />
          </label>
          <label>
            LinkedIn
            <input
              type="text"
              name="linkedin"
              value={form.social?.linkedin || ''}
              onChange={handleSocialChange}
              disabled={!editing}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </label>
          {msg && <div className={styles.success}>{msg}</div>}
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.actions}>
            {editing ? (
              <>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" onClick={() => setEditing(true)}>Edit Profile</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
