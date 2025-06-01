import React, { useState } from 'react';
import UserSearch from '../components/UserSearch';

function UserLookup() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div>
      <h2>Find a User</h2>
      <UserSearch onSelect={setSelectedUser} />
      {selectedUser && (
        <div style={{ marginTop: 20 }}>
          <h3>{selectedUser.fullName}</h3>
          <img
            src={selectedUser.profilePicture?.startsWith('http') ? selectedUser.profilePicture : selectedUser.profilePicture ? `http://localhost:5000${selectedUser.profilePicture}` : '/default-avatar.png'}
            alt="avatar"
            style={{ width: 64, height: 64, borderRadius: '50%' }}
          />
          <p>Email: {selectedUser.email}</p>
        </div>
      )}
    </div>
  );
}

export default UserLookup;
