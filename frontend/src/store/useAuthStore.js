import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
 
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
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
}));