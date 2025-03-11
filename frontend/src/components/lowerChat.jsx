import React, { useState, useEffect } from "react";
import { FaUser, FaUsers, FaArrowLeft } from "react-icons/fa";
import { useChat } from "../data/useChat";
import UpperChat from "./upperChat";
import { useAuth } from "../data/useAuth";
import { IoIosInformationCircle } from "react-icons/io";
import { formatLastOnline } from "../lib/timeUtils";

const BASE = import.meta.env.VITE_REACT_APP_SOCKET_URL;


export default function LowerChat({ onChatClick }) {
  const {
    getUsers,
    getGroups,
    users,
    groups,
    selectedChat,
    setSelectedChat,
    listenForUserUpdates,
    stopListeningForUserUpdates,
    unreadChats,
    initUnreadMessages,
  } = useChat();
  const { onlineUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getUsers();
    getGroups();
    initUnreadMessages();
    listenForUserUpdates();
    return () => stopListeningForUserUpdates();
  }, [
    getUsers,
    getGroups,
    initUnreadMessages,
    listenForUserUpdates,
    stopListeningForUserUpdates,
  ]);

  const handleProfilePicClick = (group, e) => {
    e.stopPropagation();
    setSelectedGroupForMembers(group);
    setShowMembersPopup(true);
  };

  const closeMembersPopup = () => {
    setShowMembersPopup(false);
    setSelectedGroupForMembers(null);
  };

  const hasUnreadMessages = (chatId) => unreadChats.has(chatId);
  const getUnreadCount = (chatId) => {
    const count = unreadChats.get(chatId) || 0;
    return count > 99 ? "99+" : count;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "online") return matchesSearch && onlineUsers.includes(user._id);
    if (filter === "unread") return matchesSearch && hasUnreadMessages(user._id);
    if (filter === "groups") return false; 
    return matchesSearch; 
  });

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "groups") return matchesSearch; // Only groups for "groups"
    if (filter === "all") return matchesSearch;
    if (filter === "unread") return matchesSearch && hasUnreadMessages(group._id);
    return false;
  });

  return (
    <div className="h-[100%] w-[450px] bg-white border border-gray-400 border-y-0 mt-6">
      <div className="py-3 border-b">
        <UpperChat />
        <div className="m-2 bg-[#e9edef] flex items-center h-[35px] rounded-xl px-2 mt-5">
          <input
            type="text"
            placeholder="Search"
            className="ml-3 border-none outline-none w-full text-[15px] bg-[#e9edef]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ml-2 mt-2 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "all" ? "bg-emerald-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("online")}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "online" ? "bg-emerald-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Online
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "unread" ? "bg-emerald-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("groups")}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "groups" ? "bg-emerald-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      <div className="flex flex-col overflow-y-auto">
        {filter !== "groups" && filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedChat(user);
              onChatClick(user);
            }}
            className={`w-full p-3 flex items-center justify-between gap-3 hover:bg-slate-200 transition-colors ${
              selectedChat?._id === user._id ? "bg-slate-200" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {user.profilePic ? (
                  <img
                    src={`${BASE}${user.profilePic}`}
                    alt={user.name}
                    className="size-12 object-cover rounded-full"
                  />
                ) : (
                  <div className="size-12 flex items-center justify-center rounded-full bg-gray-300">
                    <FaUser className="text-gray-600 text-2xl" />
                  </div>
                )}
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-1 ring-zinc-700" />
                )}
              </div>
              <div className="text-left min-w-0">
                <div className="font-medium truncate text-black">{user.name}</div>
                <div
                  className={`text-sm ${
                    onlineUsers.includes(user._id)
                      ? "text-emerald-400"
                      : "text-gray-400"
                  }`}
                >
                  {onlineUsers.includes(user._id)
                    ? "Online"
                    : formatLastOnline(user.lastOnline)}
                </div>
              </div>
            </div>
            <div className="flex items-center mr-6">
              {hasUnreadMessages(user._id) && (
                <span className="size-[22px] bg-green-500 rounded-full text-[12px] text-white flex justify-center items-center align-middle">
                  {getUnreadCount(user._id)}
                </span>
              )}
            </div>
          </button>
        ))}

        {filteredGroups.map((group) => (
          <button
            key={group._id}
            onClick={() => {
              setSelectedChat(group);
              onChatClick(group);
            }}
            className={`w-full p-3 flex items-center justify-between gap-3 hover:bg-slate-200 transition-colors ${
              selectedChat?._id === group._id ? "bg-slate-200" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {group.profilePic ? (
                  <span className="relative inline-block">
                    <img
                      src={`${BASE}${group.profilePic}`}
                      alt={group.name}
                      className="w-12 h-12 object-cover rounded-full cursor-pointer"
                    />
                    <IoIosInformationCircle
                      className="absolute bottom-0 right-0 w-4 h-4 text-gray-400 bg-zinc-700 rounded-full hover:text-white transition-colors duration-200"
                      onClick={(e) => handleProfilePicClick(group, e)}
                    />
                  </span>
                ) : (
                  <div className="relative size-12 flex items-center justify-center rounded-full bg-gray-300 cursor-pointer">
                    <FaUsers className="text-gray-600 text-2xl" />
                    <IoIosInformationCircle
                      className="absolute bottom-0 right-0 w-4 h-4 text-gray-400 bg-zinc-700 rounded-full hover:text-white transition-colors duration-200"
                      onClick={(e) => handleProfilePicClick(group, e)}
                    />
                  </div>
                )}
              </div>
              <div className="text-left min-w-0">
                <div className="font-medium truncate text-black">{group.name}</div>
                <div className="text-sm text-gray-400">
                  {group.members.length} members
                </div>
              </div>
            </div>
            <div className="flex items-center mr-6">
              {hasUnreadMessages(group._id) && (
                <span className="size-[22px] bg-green-500 rounded-full text-[12px] text-white flex justify-center items-center align-middle">
                  {getUnreadCount(group._id)}
                </span>
              )}
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && filteredGroups.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No chats found</div>
        )}
      </div>

      {showMembersPopup && selectedGroupForMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[400px] max-h-[80vh] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">
                {selectedGroupForMembers.name} Members
              </h3>
              <button
                onClick={closeMembersPopup}
                className="text-black hover:text-gray-600"
              >
                <FaArrowLeft className="size-5" />
              </button>
            </div>
            <div className="space-y-3">
              {selectedGroupForMembers.members.length > 0 ? (
                selectedGroupForMembers.members.map((member) => {
                  const isCreator =
                    selectedGroupForMembers.createdBy &&
                    selectedGroupForMembers.createdBy.toString() ===
                      member._id.toString();
                  return (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
                    >
                      <div className="relative">
                        {member.profilePic ? (
                          <img
                            src={`${BASE}${member.profilePic}`}
                            alt={member.name}
                            className="size-10 object-cover rounded-full"
                          />
                        ) : (
                          <div className="size-10 flex items-center justify-center rounded-full bg-gray-300">
                            <FaUser className="text-gray-600 text-xl" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">
                            {member.name}
                          </span>
                          {isCreator && (
                            <span className="text-xs text-white bg-emerald-500 px-2 py-1 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500">No members found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}