import React, { useState } from 'react';
import UserList from './UserList';
import MsgComponent from './MsgComponent';

function ChatPage({socket}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  return (
    <div className="border border-gray-700 rounded-lg p-4  flex flex-row gap-2 h-[100vh]  w-[100%]">
      <div className="w-[30%] bg-gray-800 h-[95vh] overflow-hidden">
        <UserList onSelectMember={setSelectedMember}  socket={socket} setIsOnline={setIsOnline}/>
      </div>

      <div className="w-[68%] h-full bg-gray-900 flex items-center justify-center">
        {selectedMember ? (
          <MsgComponent member={selectedMember} socket={socket} isOnline={isOnline} />
        ) : (
          <p className="text-gray-400">NA</p>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
