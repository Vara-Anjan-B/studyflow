import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './UserSearch.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function UserSearch({ onSelect }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleChange = async e => {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`${API_URL}/user/search?q=${encodeURIComponent(val)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setResults(await res.json());
    setSearching(false);
  };

  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search users by name or email..."
        className={styles.input}
      />
      {searching && <div className={styles.loading}>Searching...</div>}
      {results.length > 0 && (
        <ul className={styles.results}>
          {results.map(u => (
            <li key={u._id} onClick={() => onSelect && onSelect(u)}>
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
      )}
    </div>
  );
}

export default UserSearch;
