import React from "react";
import { useNavigate} from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MdChat } from "react-icons/md";
import { GrLogout } from "react-icons/gr";
import { IoMdSettings } from "react-icons/io";
import { FaUser } from "react-icons/fa";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleClick = async () => {
    const success = await logout();
    if (success) {
      navigate("/login");
    }
  };

  const Profile = async () => {
      navigate("/profile");
  };

  const goToHomepage = () => {
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-[#ECE5DD] shadow-md">
      {/* Left side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Chat logo/icon - responsive sizing */}
        <span 
          onClick={goToHomepage}
          className="text-xl sm:text-2xl md:text-3xl font-bold flex gap-1 sm:gap-2 text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
        >
          <MdChat className="mt-[2px] sm:mt-[3px] md:mt-[5px]" />
          <span className="hidden xs:inline sm:inline">Chat</span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        {authUser && (
          <>
            {/* Logout button */}
            <button
              onClick={handleClick}
              className="p-2 sm:px-3 sm:py-2 md:px-5 md:py-3 text-white rounded-full transition hover:text-red-50"
              title="Logout"
            >
              <GrLogout className="text-xl sm:text-2xl md:text-3xl text-black hover:text-red-600"/>
            </button>
            
            {/* Profile button with profile picture */}
            <button
              onClick={Profile}
              className="p-1 sm:p-2 md:px-5 md:py-3 text-white rounded-full transition hover:border-blue-50"
              title="Profile"
            >
              {authUser.user.profilePic ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 hover:border-blue-50 border-green-500  transition-colors">
                  <img
                    src={authUser.user.profilePic}
                    alt={authUser.user.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center">
                  <span className="text-white font-semibold text-xs sm:text-sm md:text-base">
                    {authUser.user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </button>
          </>
        )}
        
        {/* Settings button */}
        <button 
          className="p-2 sm:px-3 sm:py-2 md:px-4 md:py-2 text-black rounded-full transition hover:text-gray-100"
          title="Settings"
        >
          <IoMdSettings className="text-2xl sm:text-3xl md:text-[40px] hover:text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;