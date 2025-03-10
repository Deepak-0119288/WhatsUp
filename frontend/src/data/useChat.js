import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuth } from "./useAuth";

export const useChat = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedChat: null,
  notes: [],
  unreadChats: new Map(),

  getUsers: async () => {
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    }
  },

  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    }
  },

  createGroup: async (name, memberIds, profilePic) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("memberIds", JSON.stringify(memberIds));
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const res = await axiosInstance.post("/groups", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({ groups: [...state.groups, res.data] }));
      toast.success("Group created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  },

  updateGroup: async (groupId, name, memberIds, profilePic) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("memberIds", JSON.stringify(memberIds));
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const res = await axiosInstance.put(`/groups/${groupId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({
        groups: state.groups.map((group) =>
          group._id === groupId ? res.data : group
        ),
      }));
      toast.success("Group updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
    }
  },

  getMessages: async (chatId, isGroup = false) => {
    try {
      const endpoint = isGroup ? `/groups/${chatId}` : `/messages/${chatId}`;
      const res = await axiosInstance.get(endpoint);
      set({ messages: res.data });

      const socket = useAuth.getState().socket;
      const authUserId = useAuth.getState().authUser?._id;

      if (socket) {
        const shouldMarkAsRead = isGroup
          ? res.data.some((msg) => !msg.readBy.includes(authUserId)) 
          : res.data.some((msg) => msg.receiverId === authUserId && !msg.read); 

        if (shouldMarkAsRead) {
          socket.emit("markMessagesAsRead", { chatId, isGroup });
          set((state) => {
            const newUnreadChats = new Map(state.unreadChats);
            newUnreadChats.delete(chatId);
            return { unreadChats: newUnreadChats };
          });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    }
  },

  sendMessages: async (formData, chatId, isGroup = false) => {
    const { messages } = get();
    try {
      const endpoint = isGroup
        ? `/groups/send/${chatId}`
        : `/messages/send/${chatId}`;
      const res = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error("Failed to send message");
    }
  },

  addNote: async (text) => {
    try {
      const res = await axiosInstance.post("/messages/notes", { text });
      set((state) => ({
        notes: state.notes
          .map((note) => (note.userId === res.data.userId ? res.data : note))
          .filter((note) => note.userId !== res.data.userId)
          .concat(res.data),
      }));
      toast.success("Note updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add note");
    }
  },

  getNotes: async () => {
    try {
      const res = await axiosInstance.get("/messages/notes/all");
      set({ notes: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch notes");
    }
  },

  initUnreadMessages: async () => {
    try {
      const authUserId = useAuth.getState().authUser?._id;
      const [individualMessages, groupMessages] = await Promise.all([
        axiosInstance.get(`/messages/unread/${authUserId}`),
        axiosInstance.get(`/groups/unread/${authUserId}`),
      ]);

      const newUnreadChats = new Map();
      individualMessages.data.forEach((msg) => {
        const chatId = msg.senderId.toString();
        const count = newUnreadChats.get(chatId) || 0;
        newUnreadChats.set(chatId, count + 1);
      });
      groupMessages.data.forEach((msg) => {
        const chatId = msg.groupId.toString();
        const count = newUnreadChats.get(chatId) || 0;
        newUnreadChats.set(chatId, count + 1);
      });
      set({ unreadChats: newUnreadChats });
      console.log("Initialized unreadChats:", newUnreadChats);
    } catch (error) {
      console.error("Failed to init unread messages:", error);
    }
  },

  setSelectedChat: (chat) => set({ selectedChat: chat }),

  listenForUserUpdates: () => {
    const socket = useAuth.getState().socket;
    if (!socket) return;

    socket.on("userLastOnlineUpdated", ({ userId, lastOnline }) => {
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? { ...user, lastOnline } : user
        ),
      }));
    });

    socket.on("newNote", (newNote) => {
      set((state) => ({
        notes: state.notes
          .filter((note) => note.userId !== newNote.userId)
          .concat(newNote),
      }));
    });  
  },

  stopListeningForUserUpdates: () => {
    const socket = useAuth.getState().socket;
    socket?.off("userLastOnlineUpdated");
    socket?.off("newNote");
  },
}));