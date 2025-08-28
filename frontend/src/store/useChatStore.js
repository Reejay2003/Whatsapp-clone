import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";
import {
  fetchPeerPublicKey, deriveConversationKey,
  encryptPayload, decryptPayload,
  packToText, tryUnpackFromText
} from "../lib/e2ee";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,

  // cache conversation keys by userId
  _convKeys: {},

  async _getConvKeyFor(userId) {
    if (!userId) throw new Error("No userId");
    if (get()._convKeys[userId]) return get()._convKeys[userId];
    const peerPub = await fetchPeerPublicKey(userId);
    const key = await deriveConversationKey(peerPub);
    set({ _convKeys: { ...get()._convKeys, [userId]: key } });
    return key;
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

  // decrypt list helper
  _decryptMany: async (list, otherId) => {
    const tryDecrypt = async (msg, key) => {
      const packed = tryUnpackFromText(msg.text);
      if (!packed) return msg; // plaintext or non-e2e
      const plain = await decryptPayload(key, packed);
      return { ...msg, text: plain.text || "", image: plain.image || null, _e2e: true };
    };
  
    const out = [];
    let key = await get()._getConvKeyFor(otherId);
  
    for (const m of list) {
      try {
        out.push(await tryDecrypt(m, key));
      } catch (e) {
        // Only retry on crypto OperationError / auth tag fail
        if (String(e).includes("OperationError")) {
          try {
            // blow away cached key & re-derive from latest peer pubkey
            key = await get()._refreshConvKeyFor(otherId);
            out.push(await tryDecrypt(m, key));
          } catch (e2) {
            console.error("Decrypt failed (after refresh) for msg", m._id, e2?.message);
            out.push({ ...m, text: "[Unable to decrypt]" });
          }
        } else {
          console.error("Decrypt failed for msg", m._id, e?.message);
          out.push({ ...m, text: "[Unable to decrypt]" });
        }
      }
    }
    return out;
  },

  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      const dec = await get()._decryptMany(res.data, userId);
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
      // bundle text + image, encrypt, then pack into "text"
      const key = await get()._getConvKeyFor(userId);
      const payload = await encryptPayload(key, {
        text: (messageData.text || "").trim(),
        image: messageData.image || null,
      });
      const body = { text: packToText(payload) }; // server sees opaque string

      const res = await axiosInstance.post(`/message/send/${userId}`, body);

      // immediately decrypt own message for UI
      const decList = await get()._decryptMany([res.data], userId);
      const newMessages = [...messages, decList[0]];
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

  subscribeToMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", async (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      const dec = await get()._decryptMany([newMessage], selectedUser._id);
      set({ messages: [...get().messages, dec[0]] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
  },

 
  async _refreshConvKeyFor(userId) {
    const peerPub = await fetchPeerPublicKey(userId); // fetch latest
    const key = await deriveConversationKey(peerPub);
    set({ _convKeys: { ...get()._convKeys, [userId]: key } });
    return key;
  }
}));