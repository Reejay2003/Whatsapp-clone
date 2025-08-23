import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import Sidebar from '../components/SideBar';
import MessageContainer from '../components/MessageContainer';

const HomePage = () => {
  const { getUsers, selectedUser } = useChatStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar - Hidden on mobile when chat is selected */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 ${
        selectedUser ? 'hidden md:block' : 'block'
      }`}>
        <Sidebar />
      </div>
      
      {/* Chat Container - Hidden on mobile when no chat is selected */}
      <div className={`flex-1 min-w-0 ${
        selectedUser ? 'block' : 'hidden md:block'
      }`}>
        <MessageContainer />
      </div>
    </div>
  );
};

export default HomePage;