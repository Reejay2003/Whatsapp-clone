import React, { useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';

const MessageInput = ({ disabled = false }) => {
  const { sendMessage, selectedUser } = useChatStore();
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  const canSend = (!!messageText.trim() || !!selectedImage) && !!selectedUser && !disabled && !isSending;

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canSend) return;

    const messageToSend = messageText.trim();
    setIsSending(true);

    try {
      const userId = selectedUser?._id || selectedUser?.id;
      
      if (!userId) {
        throw new Error("No user selected");
      }

      let imageData = null;
      if (selectedImage) {
        imageData = await convertToBase64(selectedImage);
      }

      const messageData = {
        text: messageToSend || "",
        image: imageData
      };

      await sendMessage(userId, messageData);
      
      // Clear inputs after successful send
      setMessageText('');
      removeImage();
      
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 shadow-sm">
      {/* Image Preview */}
      {imagePreview && (
        <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 border-b border-gray-100">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="relative flex-shrink-0">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedImage?.name}</p>
              <p className="text-xs text-gray-400">
                {selectedImage && (selectedImage.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
        <form onSubmit={handleSubmit} className="flex items-center space-x-1 sm:space-x-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || !selectedUser || isSending}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 sm:p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
            title="Attach image"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Text input */}
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedUser ? "Type a message..." : "Select a contact to start chatting"}
            disabled={disabled || !selectedUser || isSending}
            className="flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 h-8 sm:h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:outline-none text-xs sm:text-sm text-gray-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Send button */}
          <button 
            type="submit"
            disabled={!canSend}
            className="flex-shrink-0 bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm font-medium min-w-[50px] sm:min-w-[60px] h-8 sm:h-10 flex items-center justify-center"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;