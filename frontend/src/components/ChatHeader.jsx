import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

const ChatHeader = ({ selectedUser }) => {
  const { onlineUsers } = useAuthStore();
  const { isDark } = useThemeStore();
  
  const handleBackClick = () => {
    // Clear selected user to show sidebar on mobile
    useChatStore.setState({ selectedUser: null });
  };

  const handleCloseClick = () => {
    // Clear selected user (desktop functionality)
    useChatStore.setState({ selectedUser: null });
  };

  return (
    <div className={`${isDark ? "dark" : ""} bg-header-bg dark:bg-header-bg-dark px-3 md:px-4 py-3 border-b border-border dark:border-border-dark flex items-center justify-between shadow-sm`}>
      <div className="flex items-center flex-1">
        {/* Back button - visible on mobile, hidden on desktop */}
        <button 
          className="md:hidden mr-3 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-hover-bg dark:hover:bg-hover-bg-dark p-2 rounded-full transition-colors flex-shrink-0"
          onClick={handleBackClick}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          {selectedUser?.profilePic ? (
            <img
              src={selectedUser.profilePic}
              alt={selectedUser.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-green-accent rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm md:text-base">
                {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          {/* Online indicator dot */}
          {onlineUsers.includes(selectedUser._id) && (
            <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="ml-3 min-w-0 flex-1">
          <h3 className="font-semibold text-text-primary dark:text-text-primary-dark text-sm md:text-base truncate">
            {selectedUser.name}
          </h3>
          <p className="text-text-secondary dark:text-text-secondary-dark text-xs md:text-sm flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
              onlineUsers.includes(selectedUser._id) ? 'bg-green-500' : 'bg-text-muted dark:bg-text-muted-dark'
            }`}></span>
            {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      {/* Close button - only visible on desktop */}
      <button 
        className='hidden md:flex text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-hover-bg dark:hover:bg-hover-bg-dark p-2 rounded-full transition-colors flex-shrink-0 items-center justify-center' 
        onClick={handleCloseClick}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default ChatHeader;