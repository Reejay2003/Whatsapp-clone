import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

import {
  publishMyPublicKey,
  ensureDeviceKeypair,
  createEncryptedKeyBackup,
  uploadKeyBackup,
  fetchMyKeyBackup,
  exportPrivateJwkPlain,
  restorePrivateKeyFromBackup,
} from "../lib/e2ee";

// Separate URLs for API and Socket.IO
const getSocketURL = () => {
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5002";
  }
  // In production, use environment variable or fall back to relative URL
  return import.meta.env.VITE_BACKEND_URL || "/";
};

const SOCKET_URL = getSocketURL();

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // Chat store can subscribe (set this) to drop cached conv keys on restore
  onKeysRestored: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });

      // ---- RESTORE FIRST (if missing) ----
      let haveLocal = !!(await exportPrivateJwkPlain());
      if (!haveLocal) {
        const backup = await fetchMyKeyBackup();
        if (backup) {
          const pwd = window.prompt("Enter your account password to restore encrypted chat keys");
          if (pwd) {
            try {
              await restorePrivateKeyFromBackup(pwd, backup);
              toast.success("Encryption keys restored");
              const cb = get().onKeysRestored;
              if (typeof cb === "function") cb(); // let chat store clear cached conv keys
            } catch (e) {
              console.warn("Key restore failed:", e?.message);
              toast.error("Failed to restore keys (wrong password?)");
            }
          }
        }
      }

      // ---- Ensure a keypair exists (restore may not have provided one) ----
      await ensureDeviceKeypair();

      // ---- Publish AFTER keys are settled ----
      await publishMyPublicKey();

      // ---- Connect socket last ----
      get().connectSocket();

    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      // E2EE setup
      await ensureDeviceKeypair();
      await publishMyPublicKey();

      // Backup private key using the signup password
      try {
        if (data?.password) {
          const backup = await createEncryptedKeyBackup(data.password);
          await uploadKeyBackup(backup);
        }
      } catch (e) {
        console.warn("Backup skipped:", e?.message);
      }

      toast.success("Signed up Successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      // E2EE setup
      await ensureDeviceKeypair();
      await publishMyPublicKey();

      // (Re)create/refresh backup using the login password
      try {
        if (data?.password) {
          const backup = await createEncryptedKeyBackup(data.password);
          await uploadKeyBackup(backup);
        }
      } catch (e) {
        console.warn("Backup skipped:", e?.message);
      }

      toast.success("Logged in Successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out Successfully");
      get().disconnectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      return false;
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/updateprofile", data);

      // Update the authUser with the new data from backend
      set((state) => ({
        authUser: {
          ...state.authUser,
          user: res.data.user,
        },
      }));

      toast.success("Profile updated successfully!", {
        duration: 3000,
        icon: "🎉",
      });
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      query: {
        userId: authUser.user._id,
      },
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("✅ Connected to server:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Connection error:", error);
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));