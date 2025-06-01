import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Settings.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Settings() {
  const { token, login } = useAuth();
  const [form, setForm] = useState({ fullName: '', bio: '', notificationPrefs: {} });
  const [profilePicture, setProfilePicture] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setForm({
          fullName: data.fullName || '',
          bio: data.bio || '',
          notificationPrefs: data.notificationPrefs || {},
        });
        setProfilePicture(data.profilePicture || '');
      }
    }
    fetchProfile();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg('');
    setError('');
  };

  const handlePrefsChange = e => {
    setForm({
      ...form,
      notificationPrefs: {
        ...form.notificationPrefs,
        [e.target.name]: e.target.checked,
      },
    });
    setMsg('');
    setError('');
  };

  const handleSubmit = async e => {
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
        body: JSON.stringify({ ...form, profilePicture }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Update failed.');
      else {
        setMsg('Settings updated!');
        login(data, token);
      }
    } catch {
      setError('Network error.');
    }
  };

  const handlePictureChange = async e => {
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

  const handlePasswordChange = e => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordMsg('');
    setPasswordError('');
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    try {
      const res = await fetch(`${API_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (!res.ok) setPasswordError(data.message || 'Password change failed.');
      else {
        setPasswordMsg('Password changed!');
        setPasswordForm({ oldPassword: '', newPassword: '' });
      }
    } catch {
      setPasswordError('Network error.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>User Settings</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.avatarSection}>
            <img
              src={
                profilePicture
                  ? profilePicture.startsWith('http')
                    ? profilePicture
                    : `${API_URL.replace(/\/api$/, '')}${profilePicture}`
                  : '/default-avatar.png'
              }
              alt="Profile"
              className={styles.avatar}
              onClick={() => fileInputRef.current.click()}
              style={{ cursor: 'pointer' }}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handlePictureChange}
            />
            <div style={{ fontSize: 12, color: '#6366f1', marginTop: 4 }}>
              Click to change profile picture
            </div>
          </div>
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
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
              rows={3}
            />
          </label>
          <fieldset className={styles.prefsBox}>
            <legend>Email Notifications</legend>
            <label>
              <input
                type="checkbox"
                name="accountActivity"
                checked={form.notificationPrefs?.accountActivity ?? true}
                onChange={handlePrefsChange}
              />
              Account activity (login, profile update)
            </label>
            <label>
              <input
                type="checkbox"
                name="newsletter"
                checked={form.notificationPrefs?.newsletter ?? false}
                onChange={handlePrefsChange}
              />
              Newsletter and updates
            </label>
            <label>
              <input
                type="checkbox"
                name="passwordChange"
                checked={form.notificationPrefs?.passwordChange ?? true}
                onChange={handlePrefsChange}
              />
              Password changes
            </label>
          </fieldset>
          {msg && <div className={styles.success}>{msg}</div>}
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.actions}>
            <button type="submit">Save Settings</button>
          </div>
        </form>
        <h3>Change Password</h3>
        <form className={styles.form} onSubmit={handlePasswordSubmit}>
          <label>
            Old Password
            <input
              type="password"
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              required
            />
          </label>
          <label>
            New Password
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
              minLength={8}
            />
          </label>
          {passwordMsg && <div className={styles.success}>{passwordMsg}</div>}
          {passwordError && <div className={styles.error}>{passwordError}</div>}
          <div className={styles.actions}>
            <button type="submit">Change Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;