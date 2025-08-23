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

    subscribeToMessages: async()=>{
        const {selectedUser} = get();
        if(!selectedUser) return;
        const socket = useAuthStore.getState().socket;
        socket.on("newMessage", (newMessage)=>{
            // Fixed: Changed senderID to senderId (correct property name)
            if(newMessage.senderId !== selectedUser._id) return;
            set({
                messages:[...get().messages, newMessage]
            })
        })
    },

    unsubscribeFromMessages: ()=>{
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage")
    },

    setSelectedUser: (selectedUser) => {
        console.log("Setting selected user:", selectedUser);
        set({ selectedUser });
    },

}));