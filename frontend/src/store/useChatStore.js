import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import {
  fetchPeerPublicKey,
  deriveConversationKey,
  tryUnpackFromText,
  decryptPayload,
} from "../lib/e2ee";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,

  // cache of derived AES keys by userId
  _convKeys: {},

  onKeysRestored: () => {
    // drop all derived AES keys
    set({ _convKeys: {} });
    const { selectedUser } = get();
    if (selectedUser?._id) get().getMessages(selectedUser._id);
  },

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/message/sideBar");
      set({ users: res.data });
    } catch (err) {
      console.log("Error in getUsers:", err);
      toast.error("Failed to load users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  _getConvKeyFor: async (peerId) => {
    const cache = get()._convKeys;
    if (cache[peerId]) return cache[peerId];
    const pub = await fetchPeerPublicKey(peerId);
    const key = await deriveConversationKey(pub);
    set({ _convKeys: { ...cache, [peerId]: key } });
    return key;
  },

  _decryptMany: async (peerId, msgs) => {
    const key = await get()._getConvKeyFor(peerId);
    const out = [];
    for (const m of msgs) {
      const pkg = tryUnpackFromText(m.text);
      if (!pkg) {
        out.push(m);
        continue;
      }
      try {
        const clear = await decryptPayload(key, pkg);
        out.push({ ...m, text: clear.text || "", image: clear.image || null });
      } catch (e) {
        console.warn("Decrypt failed (after refresh) for msg", m._id, e?.name || e);
        out.push({ ...m, text: "[Unable to decrypt]" });
      }
    }
    return out;
  },

  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      const dec = await get()._decryptMany(userId, res.data || []);
      set({ messages: dec });
    } catch (err) {
      console.log("Error in getMessages:", err);
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  addUserByEmail: async (email) => {
    if (!email) return;
    try {
      await axiosInstance.post("/message/sideBar", { email });
      toast.success("User added successfully");
      await get().getUsers(); // refresh user list
    } catch (err) {
      console.log("Error in addUserByEmail:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to add user";
      toast.error(errorMessage);
    }
  },

  sendMessage: async (userId, messageData) => {
    const { messages } = get();
    try {
      const res = await axiosInstance.post(`/message/send/${userId}`, messageData);
      const newMessages = [...messages, res.data];
      set({ messages: newMessages });
      return res.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send message";
      toast.error(errorMessage);
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("⚠️ Socket not connected yet in subscribeToMessages()");
      return;
    }

    socket.on("newMessage", async (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      const dec = await get()._decryptMany(selectedUser._id, [newMessage]);
      set({ messages: [...get().messages, dec[0]] });
    });
  },

  subscribeToUserUpdates: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("⚠️ Socket not connected yet in subscribeToUserUpdates()");
      return;
    }

    socket.on("userAdded", (newUser) => {
      const currentUsers = get().users;
      if (!currentUsers.some((u) => u._id === newUser._id)) {
        set({ users: [...currentUsers, newUser] });
      }
    });
  },

  unsubscribeFromAll: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("⚠️ Socket not connected yet in unsubscribeFromAll()");
      return;
    }
    socket.off("newMessage");
    socket.off("userAdded");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    // allow auth store to clear conversation keys when keys are restored
    useAuthStore.setState({ onKeysRestored: get().onKeysRestored });
  },
}));