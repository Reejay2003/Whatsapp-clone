import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { FaCamera, FaUser, FaEnvelope, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const Profile = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { isDark } = useThemeStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setImageLoading(true);
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        setSelectedImage(reader.result);
        console.log(selectedImage);
        
        
        await updateProfile({ profilePic: reader.result });
        
        toast.success("Profile picture updated successfully!", {
          duration: 3000,
          icon: '🎉'
        });
      } catch (error) {
        toast.error("Failed to update profile picture");
        setSelectedImage(null);
      } finally {
        setImageLoading(false);
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading the image file");
      setImageLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    if (isUpdatingProfile || imageLoading) return;
    document.getElementById("avatar-upload").click();
  };

  const formatMemberSince = (date) => {
    if (!date) return "Recently";
    const memberDate = new Date(date);
    return memberDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentImage = selectedImage || authUser?.user?.profilePic;

  return (
    <div className={`${isDark ? "dark" : ""} min-h-screen bg-primary1 dark:bg-primary-dark px-4 py-8`}>
      <div className="max-w-md mx-auto">
        <div className="bg-header-bg dark:bg-header-bg-dark shadow-2xl rounded-3xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-3xl">
          {/* Header with animation */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              Profile
            </h1>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm sm:text-base">
              Your profile information
            </p>
          </div>

          {/* Enhanced Profile Picture Section */}
          <div className="flex flex-col items-center mb-10">
            <div 
              className="relative group"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-green-accent to-[#20bd5a] flex items-center justify-center border-4 border-header-bg dark:border-header-bg-dark shadow-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Profile"
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                  />
                ) : (
                  <FaUser className="text-7xl text-white transition-all duration-300 group-hover:scale-110" />
                )}
                
                {/* Loading overlay */}
                {(imageLoading || isUpdatingProfile) && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                    <FaSpinner className="text-white text-2xl animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Enhanced Camera Icon */}
              <button
                onClick={handleCameraClick}
                disabled={isUpdatingProfile || imageLoading}
                className={`absolute bottom-2 right-2 p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                  isUpdatingProfile || imageLoading
                    ? 'bg-text-muted dark:bg-text-muted-dark cursor-not-allowed'
                    : 'bg-[#18a14a] hover:bg-[#20bd5a] hover:shadow-xl cursor-pointer'
                } ${isHovering ? 'animate-bounce' : ''}`}
              >
                {imageLoading || isUpdatingProfile ? (
                  <FaSpinner className="text-white text-lg animate-spin" />
                ) : (
                  <FaCamera className="text-white text-lg" />
                )}
              </button>
              
              {/* Hidden file input */}
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile || imageLoading}
              />
            </div>
            
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm mt-4 text-center transition-all duration-300 hover:text-text-primary dark:hover:text-text-primary-dark">
              Click the camera icon to update your photo
            </p>
          </div>

          {/* Enhanced Profile Information */}
          <div className="space-y-6 mb-8">
            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-3 transition-colors duration-200 group-hover:text-green-accent">
                <FaUser className="inline mr-2 text-green-accent" />
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={authUser?.user?.name || "Loading..."}
                  disabled
                  className="w-full px-4 py-3 border-2 border-input-border dark:border-input-border-dark rounded-xl bg-hover-bg dark:bg-hover-bg-dark text-text-primary dark:text-text-primary-dark cursor-not-allowed text-sm sm:text-base transition-all duration-200 hover:border-input-border-dark dark:hover:border-border focus:border-green-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="group">
              <label className="block text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-3 transition-colors duration-200 group-hover:text-green-accent">
                <FaEnvelope className="inline mr-2 text-green-accent" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={authUser?.user?.email || "Loading..."}
                  disabled
                  className="w-full px-4 py-3 border-2 border-input-border dark:border-input-border-dark rounded-xl bg-hover-bg dark:bg-hover-bg-dark text-text-primary dark:text-text-primary-dark cursor-not-allowed text-sm sm:text-base transition-all duration-200 hover:border-input-border-dark dark:hover:border-border focus:border-green-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Account Information */}
          <div className="border-t-2 border-border dark:border-border-dark pt-6">
            <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6 flex items-center">
              Account Information
            </h3>
            
            <div className="space-y-4">
              {/* Member Since */}
              <div className="flex justify-between items-center py-3 px-4 bg-hover-bg dark:bg-hover-bg-dark rounded-xl hover:bg-message-received dark:hover:bg-secondary-dark transition-colors duration-200">
                <span className="text-text-secondary dark:text-text-secondary-dark font-medium">Member Since</span>
                <span className="text-text-primary dark:text-text-primary-dark font-semibold">
                  {formatMemberSince(authUser?.user?.createdAt)}
                </span>
              </div>
              
              {/* Account Status */}
              <div className="flex justify-between items-center py-3 px-4 bg-green-50 dark:bg-secondary-dark rounded-xl hover:bg-green-100 dark:hover:bg-hover-bg-dark transition-colors duration-200">
                <span className="text-text-secondary dark:text-text-secondary-dark font-medium">Account Status</span>
                <span className="text-success font-bold flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Profile;