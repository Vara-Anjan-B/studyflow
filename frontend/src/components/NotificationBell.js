import React from 'react';

function NotificationBell({ count = 0, ...props }) {
  return (
    <span {...props} style={{ position: 'relative', cursor: 'pointer' }}>
      <span role="img" aria-label="Notifications">🔔</span>
      {count > 0 && (
        <span style={{
          position: 'absolute', top: -5, right: -5, background: '#d32f2f', color: '#fff',
          borderRadius: '50%', fontSize: 12, padding: '2px 6px', fontWeight: 700
        }}>
          {count}
        </span>
      )}
    </span>
  );
}

export default NotificationBell;
