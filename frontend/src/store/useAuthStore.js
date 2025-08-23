import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {io} from "socket.io-client";

const getSocketURL = () => {
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5002";
  }
  return import.meta.env.VITE_SOCKET_URL || window.location.origin;
};

export const useAuthStore = create((set, get) => ({
  // ... all your existing state and methods ...

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    console.log("Connecting socket for user:", authUser.user._id);

    const socket = io(getSocketURL(), {
      query: {
        userId: authUser.user._id,
      },
    });

    set({ socket: socket });

    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket.id);
      console.log("User ID sent to server:", authUser.user._id);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Connection error:", error);
    });

    socket.on("getOnlineUsers", (userIds) => {
      console.log("Online users updated:", userIds);
      set({ onlineUsers: userIds });
    });
  },

  // ... rest of your methods
}));