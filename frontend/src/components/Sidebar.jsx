import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import SidebarSkeleton from './skeleton/SidebarSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

const Sidebar = () => {
  const { users, isUserLoading, selectedUser, getMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { isDark } = useThemeStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Filter users based on online status
  const filteredUsers = showOnlineOnly 
    ? users.filter(user => onlineUsers.includes(user._id))
    : users;

  const handleUserSelect = (selectedUser) => {
    // Set the selected user and get messages
    useChatStore.setState({ selectedUser });
    getMessages(selectedUser._id);
    // On mobile, this will trigger the view switch in HomePage
  };

  return (
    <div className={`${isDark ? "dark" : ""} h-full bg-header-bg dark:bg-header-bg-dark flex flex-col`}>
      {/* Fixed Header */}
      <div className="bg-green-accent px-2 sm:px-3 md:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="text-white font-semibold text-sm sm:text-base md:text-lg">Contacts</h2>
        <label className="flex items-center space-x-1 sm:space-x-2 text-white text-xs md:text-sm">
          <input
            type="checkbox"
            className="w-3 h-3 md:w-4 md:h-4 text-white bg-white border-white rounded focus:ring-white focus:ring-2"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
          />
          <span className="text-xs sm:text-sm">Online only</span>
        </label>
      </div>

      {/* Scrollable Users List */}
      <div className="flex-1 overflow-y-auto">
        {isUserLoading ? (
          <SidebarSkeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center py-6 md:py-8">
            <div className="text-text-secondary dark:text-text-secondary-dark text-xs md:text-sm text-center px-4">
              {showOnlineOnly ? 'No online contacts found' : 'No contacts found'}
            </div>
          </div>
        ) : (
          filteredUsers.map((contact) => {
            // Check if user is online by looking in onlineUsers array
            const isContactOnline = onlineUsers.includes(contact._id);
            
            return (
              <div
                key={contact._id}
                onClick={() => handleUserSelect(contact)}
                className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 border-b border-border dark:border-border-dark cursor-pointer hover:bg-hover-bg dark:hover:bg-hover-bg-dark transition active:bg-hover-bg dark:active:bg-hover-bg-dark ${
                  selectedUser?._id === contact._id ? 'bg-green-50 dark:bg-secondary-dark' : ''
                }`}
              >
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {contact.profilePic ? (
                      <img
                        src={contact.profilePic}
                        alt={contact.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs sm:text-sm md:text-base">
                          {contact.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    {/* Online indicator dot */}
                    {isContactOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-success border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary dark:text-text-primary-dark text-sm md:text-base truncate">
                      {contact.name}
                    </h3>
                    <p className="text-text-secondary dark:text-text-secondary-dark text-xs md:text-sm flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1.5 sm:mr-2 flex-shrink-0 ${
                        isContactOnline ? 'bg-success' : 'bg-text-muted dark:bg-text-muted-dark'
                      }`}></span>
                      <span className="truncate text-xs sm:text-sm">{isContactOnline ? 'Online' : 'Offline'}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;