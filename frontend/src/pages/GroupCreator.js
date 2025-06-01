import React, { useState } from 'react';
import UserSearch from '../components/UserSearch';
import styles from './GroupCreator.module.css'; // Use or add chip styles here

function GroupCreator() {
  const [members, setMembers] = useState([]);

  const handleAddMember = userObj => {
    if (!members.some(m => m._id === userObj._id)) {
      setMembers([...members, userObj]);
    }
  };

  const handleRemoveMember = id => {
    setMembers(members.filter(m => m._id !== id));
  };

  return (
    <div>
      <h2>Create Group</h2>
      <UserSearch onSelect={handleAddMember} />
      <div className={styles.membersList}>
        {members.map(m => (
          <span key={m._id} className={styles.memberChip}>
            {m.fullName}
            <button type="button" onClick={() => handleRemoveMember(m._id)} title="Remove">
              &times;
            </button>
          </span>
        ))}
      </div>
      {/* Add your group creation form here, using members.map(m => m._id) */}
    </div>
  );
}

export default GroupCreator;