import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import Sidebar from '../components/Sidebar';
import MessageContainer from '../components/MessageContainer';

const HomePage = () => {
  const { getUsers, selectedUser } = useChatStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#ECE5DD]">
      {/* On mobile: show sidebar when no user is selected, hide when user is selected */}
      {/* On desktop: always show sidebar */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 xl:w-1/3`}>
        <Sidebar />
      </div>
      
      {/* On mobile: show message container when user is selected, hide when no user is selected */}
      {/* On desktop: always show message container */}
      <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1`}>
        <MessageContainer />
      </div>
    </div>
  );
};

export default HomePage;