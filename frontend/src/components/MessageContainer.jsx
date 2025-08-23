import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import ChatHeader from './ChatHeader';
import MessagesArea from './MessageArea'; 
import MessageInput from './MessageInput';

const MessageContainer = () => {
  const { authUser } = useAuthStore();
  const { subscribeToMessages, unsubscribeFromMessages, selectedUser, messages, getMessages, isMessagesLoading } = useChatStore();

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return() => unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, unsubscribeFromMessages, subscribeToMessages]);

  return (
    <div className="h-full flex flex-col bg-[#f8f9fa]">
      {selectedUser ? (
        <>
          {/* Fixed Chat Header */}
          <div className="flex-shrink-0">
            <ChatHeader selectedUser={selectedUser} />
          </div>
          
          {/* Scrollable Messages Area */}
          <div className="flex-1 min-h-0">
            <MessagesArea 
              messages={messages}
              selectedUser={selectedUser}
              authUser={authUser}
              isMessagesLoading={isMessagesLoading}
            />
          </div>
          
          {/* Fixed Message Input */}
          <div className="flex-shrink-0">
            <MessageInput />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp Logo"
                className="w-8 h-8 md:w-12 md:h-12"
              />
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
              Welcome to WhatsApp Clone
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Select a contact to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;