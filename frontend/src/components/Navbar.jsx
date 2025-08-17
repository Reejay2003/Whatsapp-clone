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

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-[#ECE5DD] shadow-md">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Example: Chat logo/icon */}
        <span className="text-3xl font-bold flex gap-2 text-blue-600 "><MdChat className="mt-[5px]" />  Chat</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {authUser && (
          <>
            <button
              onClick={handleClick}
              className="px-5 py-3 text-white rounded-full  transition"
            >
              <GrLogout className="text-3xl text-black hover:text-red-600"/>
            </button>
            <button
              onClick={Profile}
              className="px-5 py-3 text-white rounded-full  transition"
            >
              <FaUser className="text-3xl text-black hover:text-blue-600"/>
            </button>
          </>
        )}
        <button className="px-4 py-2 text-black rounded-full  transition">
        <IoMdSettings className="text-[40px] hover:text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;