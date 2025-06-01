import React from 'react';
import UserSearch from '../components/UserSearch';

function DirectMessageStart() {
  const handleSelect = user => {
    // Redirect to messages page or open chat with user
    window.location.href = `/messages?user=${user._id}`;
  };

  return (
    <div>
      <h2>Start a Direct Message</h2>
      <UserSearch onSelect={handleSelect} />
    </div>
  );
}

export default DirectMessageStart;
