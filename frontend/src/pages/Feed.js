import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Feed.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Feed() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState({});
  const [comments, setComments] = useState({}); // { postId: [comments] }

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPosts(data);
      else setError(data.message || 'Could not load posts.');
    } catch {
      setError('Network error.');
    }
  };

  const fetchComments = async postId => {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setComments(c => ({ ...c, [postId]: data }));
    } catch {}
  };

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`${API_URL}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setPosts(data);
        else setError(data.message || 'Could not load posts.');
      } catch {
        setError('Network error.');
      }
    }
    fetchPosts();
  }, [token]);


  const handlePost = async e => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Error posting.');
      else {
        setMsg('Posted!');
        setNewContent('');
        fetchPosts();
      }
    } catch {
      setError('Network error.');
    }
  };

  const handleDeletePost = async id => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMsg('Post deleted.');
        fetchPosts();
      } else {
        setError('Error deleting post.');
      }
    } catch {
      setError('Network error.');
    }
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentContent[postId] }),
      });
      if (res.ok) {
        setCommentContent(c => ({ ...c, [postId]: '' }));
        fetchComments(postId);
      }
    } catch {}
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      const res = await fetch(`${API_URL}/posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchComments(postId);
    } catch {}
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Feed</h2>
        <form className={styles.form} onSubmit={handlePost}>
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={2}
            maxLength={300}
            required
          />
          <button type="submit">Post</button>
        </form>
        {msg && <div className={styles.success}>{msg}</div>}
        {error && <div className={styles.error}>{error}</div>}
        <ul className={styles.postList}>
          {posts.map(post => (
            <li key={post._id} className={styles.postItem}>
              <div className={styles.postHeader}>
                <img
                  src={post.user.profilePicture?.startsWith('http') ? post.user.profilePicture : post.user.profilePicture ? `${API_URL.replace(/\/api$/, '')}${post.user.profilePicture}` : '/default-avatar.png'}
                  alt="avatar"
                  className={styles.avatar}
                />
                <span className={styles.author}>{post.user.fullName}</span>
                <span className={styles.date}>{new Date(post.createdAt).toLocaleString()}</span>
                {user && user.id === post.user._id && (
                  <button className={styles.deleteBtn} onClick={() => handleDeletePost(post._id)}>Delete</button>
                )}
              </div>
              <div className={styles.postContent}>{post.content}</div>
              <div className={styles.commentsSection}>
                <button className={styles.showCommentsBtn} onClick={() => fetchComments(post._id)}>
                  Show Comments
                </button>
                <ul className={styles.commentList}>
                  {(comments[post._id] || []).map(c => (
                    <li key={c._id} className={styles.commentItem}>
                      <img
                        src={c.user.profilePicture?.startsWith('http') ? c.user.profilePicture : c.user.profilePicture ? `${API_URL.replace(/\/api$/, '')}${c.user.profilePicture}` : '/default-avatar.png'}
                        alt="avatar"
                        className={styles.avatarSmall}
                      />
                      <span className={styles.commentAuthor}>{c.user.fullName}</span>
                      <span className={styles.commentText}>{c.content}</span>
                      <span className={styles.commentDate}>{new Date(c.createdAt).toLocaleString()}</span>
                      {user && user.id === c.user._id && (
                        <button className={styles.deleteBtnSmall} onClick={() => handleDeleteComment(c._id, post._id)}>Delete</button>
                      )}
                    </li>
                  ))}
                </ul>
                <form className={styles.commentForm} onSubmit={e => handleComment(e, post._id)}>
                  <input
                    type="text"
                    value={commentContent[post._id] || ''}
                    onChange={e => setCommentContent(c => ({ ...c, [post._id]: e.target.value }))}
                    placeholder="Write a comment..."
                    maxLength={200}
                    required
                  />
                  <button type="submit">Comment</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Feed;