import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Files.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace(/\/api$/, '');

function Files() {
  const { token } = useAuth();
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch(`${API_URL}/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setFiles(data);
        else setError(data.message || 'Could not load files.');
      } catch {
        setError('Network error.');
      }
    }
    fetchFiles();
  }, [token]);

  const handleUpload = async e => {
    setMsg('');
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_URL}/files/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Upload failed.');
      else {
        setMsg('File uploaded!');
        // Refresh file list after upload
        async function fetchFiles() {
          try {
            const res = await fetch(`${API_URL}/files`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setFiles(data);
            else setError(data.message || 'Could not load files.');
          } catch {
            setError('Network error.');
          }
        }
        fetchFiles();
      }
    } catch {
      setError('Network error.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this file?')) return;
    try {
      const res = await fetch(`${API_URL}/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMsg('File deleted.');
        // Refresh file list after delete
        async function fetchFiles() {
          try {
            const res = await fetch(`${API_URL}/files`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setFiles(data);
            else setError(data.message || 'Could not load files.');
          } catch {
            setError('Network error.');
          }
        }
        fetchFiles();
      } else {
        setError('Error deleting file.');
      }
    } catch {
      setError('Network error.');
    }
  };

  const handleDownload = file => {
    window.open(`${BACKEND_URL}/api/files/download/${file._id}`, '_blank');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Your Files</h2>
        <div className={styles.uploadSection}>
          <button
            className={styles.uploadBtn}
            onClick={() => fileInputRef.current.click()}
          >
            Upload File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
        </div>
        {msg && <div className={styles.success}>{msg}</div>}
        {error && <div className={styles.error}>{error}</div>}
        <ul className={styles.fileList}>
          {files.map(file => (
            <li key={file._id} className={styles.fileItem}>
              <span className={styles.fileName}>{file.originalname}</span>
              <span className={styles.fileMeta}>
                {(file.size / 1024).toFixed(1)} KB | {new Date(file.uploadedAt).toLocaleString()}
              </span>
              <button className={styles.downloadBtn} onClick={() => handleDownload(file)}>
                Download
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(file._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Files;
