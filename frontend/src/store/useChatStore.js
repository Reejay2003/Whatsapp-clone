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
      if (!pkg) { out.push(m); continue; }
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

  sendMessage: async (userId, messageData) => {
    const { messages } = get();
    try {
      // If you encrypt on the client before sending, make sure it's already packed as e2e1:<ct>:<iv>
      const res = await axiosInstance.post(`/message/send/${userId}`, messageData);
      const newMessages = [...messages, res.data];
      set({ messages: newMessages });
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Failed to send message";
      toast.error(errorMessage);
      throw error;
    }
  },

  subscribeToMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", async (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      // Try decrypt incoming
      const dec = await get()._decryptMany(selectedUser._id, [newMessage]);
      set({ messages: [...get().messages, dec[0]] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    // also let auth store know how to clear keys on restore
    useAuthStore.setState({ onKeysRestored: get().onKeysRestored });
  },
}));