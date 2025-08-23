import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,

    getUsers: async() => {
        set({isUserLoading: true});
        try{
            const res = await axiosInstance.get("/message/sideBar");
            set({ users: res.data });
        }catch(err){
            console.log("Error in getUsers:", err);
            toast.error("Failed to load users");
        }finally{
            set({isUserLoading: false});
        }
    },

    getMessages: async(userId) => {
        if (!userId) return;
        
        set({isMessagesLoading: true});
        try{
            const res = await axiosInstance.get(`/message/${userId}`);
            set({messages: res.data });
        }catch(err){
            console.log("Error in getMessages:", err);
            toast.error("Failed to load messages");
        }finally{
            set({isMessagesLoading: false});
        }
    },

    sendMessage: async (userId, messageData) => { 
        const { messages } = get();
        
        try {
            const res = await axiosInstance.post(`/message/send/${userId}`, messageData);
            
            // Add the new message to the messages array
            const newMessages = [...messages, res.data];
            set({ messages: newMessages });
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Failed to send message";
            toast.error(errorMessage);
            throw error;
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
        
        const socket = useAuthStore.getState().socket;
        const authUser = useAuthStore.getState().authUser;
        
        if (!socket || !authUser) {
            console.log("Socket or auth user not available for subscription");
            return;
        }
    
        console.log("Subscribing to messages for conversation with:", selectedUser._id);
    
        // Remove existing listener to prevent duplicates
        socket.off("newMessage");
    
        // Listen for new messages
        socket.on("newMessage", (newMessage) => {
            console.log("📨 Received new message:", newMessage);
            console.log("Current selected user:", selectedUser._id);
            console.log("My user ID:", authUser.user._id);
            
            // Check if the message belongs to the current conversation
            const isPartOfCurrentConversation = 
                (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser.user._id) ||
                (newMessage.senderId === authUser.user._id && newMessage.receiverId === selectedUser._id);
            
            console.log("Message belongs to current conversation:", isPartOfCurrentConversation);
            
            if (isPartOfCurrentConversation) {
                console.log("Adding message to current conversation");
                set({
                    messages: [...get().messages, newMessage]
                });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            console.log("Unsubscribing from messages");
            socket.off("newMessage");
            socket.off("messageDelivered");
        }
    },

    setSelectedUser: (selectedUser) => {
        console.log("Setting selected user:", selectedUser);
        
        // Unsubscribe from previous user's messages
        get().unsubscribeFromMessages();
        
        // Set the new selected user
        set({ selectedUser });
        
        // Subscribe to the new user's messages
        if (selectedUser) {
            // Small delay to ensure state is updated
            setTimeout(() => {
                get().subscribeToMessages();
            }, 100);
        }
    },

    // Add this method to initialize socket listeners
    initializeSocket: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        console.log("Initializing socket listeners");
        
        socket.on("connect", () => {
            console.log("✅ Chat store: Socket connected");
        });

        socket.on("disconnect", () => {
            console.log("❌ Chat store: Socket disconnected");
        });
    },

}));