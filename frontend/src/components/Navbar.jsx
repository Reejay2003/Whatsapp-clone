import React from "react";
import { useNavigate} from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MdChat } from "react-icons/md";
import { GrLogout } from "react-icons/gr";
import { IoMdSettings } from "react-icons/io";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate("/login");
    }
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const goToHomepage = () => {
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-[#ECE5DD] shadow-md flex-shrink-0 h-14 sm:h-16">
      {/* Left side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Chat logo/icon - responsive sizing */}
        <button 
          onClick={goToHomepage}
          className="text-lg sm:text-xl md:text-2xl font-bold flex gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 transition-colors items-center"
        >
          <MdChat className="text-xl sm:text-2xl md:text-3xl" />
          <span className="hidden xs:inline text-base sm:text-lg md:text-xl">Chat</span>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        {authUser && (
          <>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 text-black hover:text-red-600 rounded-full transition-colors"
              title="Logout"
            >
              <GrLogout className="text-lg sm:text-xl md:text-2xl"/>
            </button>
            
            {/* Profile button with profile picture */}
            <button
              onClick={handleProfile}
              className="p-1 sm:p-1.5 rounded-full transition-colors"
              title="Profile"
            >
              {authUser.user.profilePic ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-green-500 hover:border-blue-500 transition-colors">
                  <img
                    src={authUser.user.profilePic}
                    alt={authUser.user.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center">
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {authUser.user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </button>
          </>
        )}
        
        {/* Settings button */}
        <button 
          className="p-1.5 sm:p-2 text-black hover:text-gray-700 rounded-full transition-colors"
          title="Settings"
        >
          <IoMdSettings className="text-lg sm:text-xl md:text-2xl" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;