import React from 'react'
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const HomePage = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const handleClick = async() => {
    const success = await logout(); 
    if (success) {
        navigate("/login");
    }
  }
  return (
    <div><button onClick={handleClick}>Logout</button></div>
  )
}

export default HomePage