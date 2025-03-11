import React, { useState, useEffect, useRef } from "react";
import { FaWhatsapp, FaCheck, FaCheckDouble } from "react-icons/fa";
import { FaImages } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { X } from "lucide-react";
import { useChat } from "../data/useChat";
import { useAuth } from "../data/useAuth";
import ChatHeader from "./ChatHeader";
import time from "../lib/time";
import toast from "react-hot-toast";

const BASE = import.meta.env.VITE_REACT_APP_SOCKET_URL;

export default function ChatWindow() {
  const { messages, getMessages, selectedChat, sendMessages } = useChat();
  const { authUser, socket } = useAuth();
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!selectedChat || !selectedChat._id) return;

    const isGroup = !!selectedChat.members;
    getMessages(selectedChat._id, isGroup);
  }, [selectedChat, getMessages]);

  useEffect(() => {
    scrollToBottom();
    const observer = new ResizeObserver(scrollToBottom);
    if (chatContainerRef.current) {
      observer.observe(chatContainerRef.current);
    }
    return () => {
      if (chatContainerRef.current) {
        observer.unobserve(chatContainerRef.current);
      }
    };
  }, [messages]);

  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleNewMessage = (newMessage) => {
      const isGroup = !!selectedChat.members;
      const chatId = isGroup
        ? newMessage.groupId
        : newMessage.senderId === authUser._id
        ? newMessage.receiverId
        : newMessage.senderId;

      if (chatId === selectedChat._id) {
        useChat.setState((state) => ({
          messages: state.messages
            .map((m) => (m._id === newMessage._id ? newMessage : m))
            .concat(
              state.messages.some((m) => m._id === newMessage._id)
                ? []
                : [newMessage]
            ),
        }));
        if (
          (!isGroup && newMessage.receiverId === authUser._id) ||
          (isGroup && !newMessage.readBy.includes(authUser._id))
        ) {
          socket.emit("markMessagesAsRead", {
            chatId: selectedChat._id,
            isGroup,
          });
        }
      }
    };

    const handleMessageDelivered = (updatedMessage) => {
      const isGroup = !!selectedChat.members;
      const chatId = isGroup
        ? updatedMessage.groupId
        : updatedMessage.senderId === authUser._id
        ? updatedMessage.receiverId
        : updatedMessage.senderId;

      if (chatId === selectedChat._id) {
        useChat.setState((state) => ({
          messages: state.messages.map((m) =>
            m._id === updatedMessage._id ? { ...m, delivered: true } : m
          ),
        }));
      }
    };

    const handleMessageRead = (updatedMessage) => {
      const isGroup = !!selectedChat.members;
      const chatId = isGroup
        ? updatedMessage.groupId
        : updatedMessage.senderId === authUser._id
        ? updatedMessage.receiverId
        : updatedMessage.senderId;

      if (chatId === selectedChat._id) {
        useChat.setState((state) => ({
          messages: state.messages.map((m) =>
            m._id === updatedMessage._id
              ? {
                  ...m,
                  read: updatedMessage.read,
                  readBy: updatedMessage.readBy,
                }
              : m
          ),
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDelivered", handleMessageDelivered);
    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDelivered", handleMessageDelivered);
      socket.off("messageRead", handleMessageRead);
    };
  }, [socket, selectedChat, authUser]);

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!socket || !selectedChat) return;

    const isGroup = !!selectedChat.members;
    const chatId = selectedChat._id; // Group ID or Receiver's ID

    if (e.target.value.trim()) {
      socket.emit("typing", {
        chatId,
        isGroup,
        senderId: authUser._id,
        username: authUser.name,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId,
        isGroup,
        senderId: authUser._id,
      });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    if (!selectedChat) {
      toast.error("No chat selected");
      return;
    }

    const formData = new FormData();
    formData.append("text", text.trim());
    if (image) formData.append("image", image);

    const isGroup = !!selectedChat.members;
    const chatId = selectedChat._id;
    await sendMessages(formData, chatId, isGroup);
    setText("");
    setImage(null);

    if (socket) {
      socket.emit("stopTyping", { chatId, isGroup, senderId: authUser._id });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Only images are allowed");
      e.target.value = "";
      return;
    }
    setImage(file);
  };

  const removeImage = () => setImage(null);

  const getTickStatus = (msg) => {
    if ((msg.senderId._id || msg.senderId) !== authUser._id) return null;

    const isGroup = !!msg.groupId;
    if (isGroup) {
      if (!selectedChat.members) return <FaCheck className="text-gray-500" />;
      const groupMembers = selectedChat.members.map((m) => m._id.toString());
      const membersExceptSender = groupMembers.filter(
        (id) => id !== authUser._id.toString()
      );
      const readBy = (msg.readBy || []).map((id) => id.toString());
      const allRead = membersExceptSender.every((id) => readBy.includes(id));

      if (allRead) {
        return <FaCheckDouble className="text-blue-500" />;
      }
      if (msg.delivered) {
        return <FaCheckDouble className="text-gray-500" />;
      }
      return <FaCheck className="text-gray-500" />;
    } else {
      if (msg.read) {
        return <FaCheckDouble className="text-blue-500" />;
      }
      if (msg.delivered) {
        return <FaCheckDouble className="text-gray-500" />;
      }
      return <FaCheck className="text-gray-500" />;
    }
  };

  if (!selectedChat) {
    return (
      <div className="h-[97vh] w-full md:w-[952px] bg-cover bg-center bg-[#e7ddd2] mt-6 mr-0 md:mr-[10px]">
        <div className="flex flex-col justify-center items-center mx-auto align-middle mt-[25%]">
          <FaWhatsapp className="text-green-500 text-[90px]" />
          <h2 className="text-3xl text-slate-700 font-semibold">
            WhatsUp by ~Deepak
          </h2>
          <div className="text-center text-slate-500">
            <p>
              Send and Receive messages, Stay connected across your device
              effortlessly.
            </p>
            <p>This is my MERN Stack Project. Hope You like it!!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[97vh] w-full md:w-[952px] bg-center bg-cover mt-6 mr-0 md:mr-3">
      <div className="h-full flex flex-col overflow-hidden">
        <ChatHeader />
        <div
          ref={chatContainerRef}
          className="flex-1 bg-[url('../public/d-img.jpg')] overflow-y-auto p-4"
        >
          {messages.length === 0 ? (
            <div className="text-center text-slate-500">No messages yet</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${
                  (msg.senderId._id || msg.senderId) === authUser._id
                    ? "chat-end"
                    : "chat-start"
                } from-neutral-50`}
              >
                {msg.image && (
                  <div
                    className={`mt-2 flex flex-col ${
                      (msg.senderId._id || msg.senderId) === authUser._id
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    {!!selectedChat.members &&
                      (msg.senderId._id || msg.senderId) !== authUser._id && (
                        <span className="text-sm text-gray-600 mb-1">
                          {msg.senderId.name}
                        </span>
                      )}
                    <img
                      src={`${BASE}${msg.image}`}
                      alt="Sent Image"
                      className="max-w-[200px] rounded-lg border border-gray-500"
                      onLoad={scrollToBottom}
                    />
                    <div
                      className={`flex items-center ${
                        (msg.senderId._id || msg.senderId) === authUser._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <time className="text-xs text-slate-500 mt-1 mr-1">
                        {time(msg.createdAt)}
                      </time>
                      {(msg.senderId._id || msg.senderId) === authUser._id &&
                        getTickStatus(msg)}
                    </div>
                  </div>
                )}
                {msg.text && (
                  <div
                    className={`chat-bubble flex flex-col max-w-[75%] break-words ${
                      (msg.senderId._id || msg.senderId) === authUser._id
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-950 text-white border"
                    }`}
                  >
                    {!!selectedChat.members &&
                      (msg.senderId._id || msg.senderId) !== authUser._id && (
                        <span className="text-sm text-gray-400 mb-1">
                          {msg.senderId.name}
                        </span>
                      )}
                    <p>{msg.text}</p>
                    <div className="self-end text-right flex items-center gap-1">
                      <time className="text-xs opacity-50">
                        {time(msg.createdAt)}
                      </time>
                      {(msg.senderId._id || msg.senderId) === authUser._id &&
                        getTickStatus(msg)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-[#e9edef] shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-center gap-2"
          >
            {image && (
              <div className="absolute bottom-full mb-5 left-0 flex flex-col items-center">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="max-w-[300px] max-h-[300px] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <FaImages size={30} className="text-emerald-800" />
            </button>
            <input
              type="text"
              className="w-full text-black outline-none bg-white input input-bordered rounded-lg input-md transition-all"
              placeholder="Type a message..."
              value={text}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (text.trim() || image))
                  handleSendMessage(e);
              }}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button type="submit">
              <IoSend size={30} className="text-emerald-800" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
