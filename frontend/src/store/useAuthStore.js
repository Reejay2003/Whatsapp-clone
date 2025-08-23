import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {io} from "socket.io-client";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket:null, 
 
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async(data)=>{
    set({ isSigningUp: true }); 
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({authUser: res.data});
      toast.success("Signed up Successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      return false;
    }finally {
      set({ isSigningUp: false });
    }
  },

  login: async(data)=>{
    set({ isLoggingIn: true }); 
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({authUser: res.data});
      toast.success("Logged in Successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }finally {
      set({ isLoggingIn: false });
    }
  },

  logout:async()=>{
    try {
      await axiosInstance.post("/auth/logout");
      set({authUser:null});
      toast.success("Logged out Successfully");
      get().disconnectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      return false;
    }
  },

  updateProfile:async(data)=>{
    set({isUpdatingProfile:true});
    try {
      const res = await axiosInstance.put("/auth/updateprofile", data);
      
      // Update the authUser with the new data from backend
      set((state) => ({
        authUser: {
          ...state.authUser,
          user: res.data.user 
        }
      }));
      
      toast.success("Profile updated successfully!", {
        duration: 3000,
        icon: '🎉'
      });
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      return false;
    }finally{
      set({isUpdatingProfile: false});
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser.user._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));