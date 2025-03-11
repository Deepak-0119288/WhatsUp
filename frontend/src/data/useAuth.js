import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChat } from "./useChat";

const URL = import.meta.env.VITE_REACT_APP_SOCKET_URL;

const BASE_URL = URL;

export const useAuth = create((set, get) => ({
  authUser: null,
  ischeckingAuth: true,
  onlineUsers: [],
  socket: null,
  socketConnectedAt: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      console.log("checkAuth response:", res.data);
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ ischeckingAuth: false });
    }
  },

  signup: async (formData) => {
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: res.data });
      toast.success("Account created Successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  login: async (formData) => {
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      set({ authUser: res.data });
      toast.success("Logged in Successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      get().disConnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },  

  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put("auth/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        authUser: { ...state.authUser, profilePic: response.data.profilePic },
      }));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    console.log(BASE_URL);
    const socket = io(BASE_URL, {  
      query: { userId: authUser._id },
    });
    socket.connect();
    set({ socket });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      set({ socketConnectedAt: Date.now() });
      useChat.getState().initUnreadMessages();
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("newMessage", (newMessage) => {
      const authUserId = get().authUser?._id;
      const chatId = newMessage.groupId
        ? newMessage.groupId
        : newMessage.senderId === authUserId
        ? newMessage.receiverId
        : newMessage.senderId;

      const { selectedChat, unreadChats } = useChat.getState();
      const setChatState = useChat.setState;
      const socketConnectedAt = get().socketConnectedAt;

      const isNewMessage = socketConnectedAt && new Date(newMessage.createdAt) > new Date(socketConnectedAt);
      if (
        isNewMessage &&
        !(
          selectedChat &&
          ((!selectedChat.members && (newMessage.receiverId === selectedChat._id || newMessage.senderId === selectedChat._id)) ||
          (selectedChat.members && newMessage.groupId === selectedChat._id))
        ) &&
        ((newMessage.receiverId === authUserId && !newMessage.read) ||
         (newMessage.groupId && !newMessage.readBy.includes(authUserId)))
      ) {
        const newUnreadChats = new Map(unreadChats);
        const count = newUnreadChats.get(chatId) || 0;
        newUnreadChats.set(chatId, count + 1);
        setChatState({ unreadChats: newUnreadChats });
        console.log("New unread message for chat:", chatId, "Count:", newUnreadChats.get(chatId));
      }
    });

    socket.on("messageRead", (updatedMessage) => {
      const authUserId = get().authUser?._id;
      const chatId = updatedMessage.groupId || 
        (updatedMessage.senderId === authUserId ? updatedMessage.receiverId : updatedMessage.senderId);
      const { unreadChats } = useChat.getState();
      const setChatState = useChat.setState;

      const newUnreadChats = new Map(unreadChats);
      // Only clear unread count if the current user is the one who read the message
      const isReader = updatedMessage.groupId
        ? updatedMessage.readBy.includes(authUserId)
        : updatedMessage.receiverId === authUserId && updatedMessage.read;

      if (isReader) {
        newUnreadChats.delete(chatId);
        setChatState({ unreadChats: newUnreadChats });
      }
    });
  },

  disConnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.off("getOnlineUsers");
      socket.off("newMessage");
      socket.off("messageRead");
      socket.disconnect();
    }
    set({ socket: null, socketConnectedAt: null });
  },
}));