import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Tasks.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Tasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTasks(data);
        else setError(data.message || 'Could not load tasks.');
      } catch {
        setError('Network error.');
      }
    }
    fetchTasks();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg('');
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_URL}/tasks/${editingId}`
        : `${API_URL}/tasks`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Error saving task.');
      else {
        setMsg(editingId ? 'Task updated!' : 'Task added!');
        setForm({ title: '', description: '', dueDate: '' });
        setEditingId(null);
        // Refresh tasks
        async function fetchTasks() {
          try {
            const res = await fetch(`${API_URL}/tasks`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setTasks(data);
            else setError(data.message || 'Could not load tasks.');
          } catch {
            setError('Network error.');
          }
        }
        fetchTasks();
      }
    } catch {
      setError('Network error.');
    }
  };

  const handleEdit = task => {
    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    setEditingId(task._id);
    setMsg('');
    setError('');
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMsg('Task deleted.');
        // Refresh tasks
        async function fetchTasks() {
          try {
            const res = await fetch(`${API_URL}/tasks`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setTasks(data);
            else setError(data.message || 'Could not load tasks.');
          } catch {
            setError('Network error.');
          }
        }
        fetchTasks();
      } else {
        setError('Error deleting task.');
      }
    } catch {
      setError('Network error.');
    }
  };

  const handleToggle = async task => {
    try {
      const res = await fetch(`${API_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...task, completed: !task.completed }),
      });
      if (res.ok) {
        // Refresh tasks
        async function fetchTasks() {
          try {
            const res = await fetch(`${API_URL}/tasks`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setTasks(data);
            else setError(data.message || 'Could not load tasks.');
          } catch {
            setError('Network error.');
          }
        }
        fetchTasks();
      }
    } catch {}
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Your Tasks</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              maxLength={300}
            />
          </label>
          <label>
            Due Date
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </label>
          <div className={styles.actions}>
            <button type="submit">{editingId ? 'Update' : 'Add'} Task</button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: '', description: '', dueDate: '' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
          {msg && <div className={styles.success}>{msg}</div>}
          {error && <div className={styles.error}>{error}</div>}
        </form>
        <ul className={styles.taskList}>
          {tasks.map(task => (
            <li key={task._id} className={task.completed ? styles.completed : ''}>
              <div className={styles.taskInfo}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task)}
                />
                <span className={styles.taskTitle}>{task.title}</span>
                {task.dueDate && (
                  <span className={styles.dueDate}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className={styles.taskActions}>
                <button onClick={() => handleEdit(task)}>Edit</button>
                <button onClick={() => handleDelete(task._id)}>Delete</button>
              </div>
              {task.description && (
                <div className={styles.taskDesc}>{task.description}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Tasks;
