import React from 'react';
import MessageSkeleton from "../components/skeleton/MessageSkeleton";

const MessagesArea = ({ messages, selectedUser, authUser, isMessagesLoading }) => {
  if (isMessagesLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-[#f8f9fa]">
        <MessageSkeleton />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-[#f8f9fa]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-6 h-6 md:w-8 md:h-8"
              />
            </div>
            <p className="text-gray-500 text-xs md:text-sm">
              Start a conversation with {selectedUser.name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-[#f8f9fa]">
      {messages.map((message) => {
        const isMyMessage = message.senderId === authUser?.user?._id;
        const hasImage = !!message.image;
        const hasText = !!message.text;

        return (
          <div
            key={message._id}
            className={`chat ${isMyMessage ? 'chat-end' : 'chat-start'}`}
          >
            <div className={`chat-bubble max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg shadow-sm ${
              isMyMessage
                ? 'bg-green-500 text-white'
                : 'bg-base-200 text-base-content'
            }`} style={{
              backgroundColor: isMyMessage ? '#25D366' : '#ffffff',
              color: isMyMessage ? '#ffffff' : '#1f2937',
              padding: hasImage && !hasText ? '4px' : '12px'
            }}>
              {/* Image */}
              {hasImage && (
                <div className="relative">
                  <img
                    src={message.image}
                    alt="Message attachment"
                    className="w-full h-auto max-h-80 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Text content */}
              {hasText && (
                <div className={`${hasImage ? 'mt-2' : ''}`}>
                  <p className="break-words text-xs md:text-sm">{message.text}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesArea;