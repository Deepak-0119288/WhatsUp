import { X } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { useChat } from "../data/useChat";
import { useAuth } from "../data/useAuth";
import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_REACT_APP_SOCKET_URL;


const ChatHeader = () => {
  const { selectedChat, setSelectedChat } = useChat();
  const { socket, authUser } = useAuth();
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleTyping = ({ chatId, senderId, username, isGroup }) => {
      const expectedChatId = selectedChat._id;

      const matchesChat = isGroup
        ? chatId === expectedChatId
        : senderId === expectedChatId;

      if (matchesChat && senderId !== authUser._id) {
        setTypingUsers((prev) => {
          if (!prev.some((user) => user.userId === senderId)) {
            return [...prev, { userId: senderId, username }];
          }
          return prev;
        });
      }
    };

    const handleStopTyping = ({ chatId, senderId, isGroup }) => {
      const expectedChatId = selectedChat._id;

      const matchesChat = isGroup
        ? chatId === expectedChatId
        : senderId === expectedChatId;

      if (matchesChat && senderId !== authUser._id) {
        setTypingUsers((prev) => prev.filter((user) => user.userId !== senderId));
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      setTypingUsers([]);
    };
  }, [socket, selectedChat, authUser]);

  const typingText = typingUsers.length > 0
    ? `${typingUsers.map((u) => u.username).join(", ")} ${typingUsers.length === 1 ? "is" : "are"} typing...`
    : null;

  return (
    <div className="p-2.5 bg-slate-50 h-18 border-b">
      <div className="flex items-center justify-between">  
        <div className="flex items-center gap-3">
          <div className="pt-1 flex flex-row text-black">
            <div className="size-12 flex items-center justify-center rounded-full bg-gray-300">
              {selectedChat?.profilePic ? (
                <img
                  src={`${BASE}${selectedChat.profilePic}`}
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-600 text-2xl" />
              )}
            </div>
            <div className="ml-5">
              <h3 className="font-semibold mt-1">{selectedChat.name}</h3>
              {typingText && (
                <p className="text-sm text-green-600 italic">{typingText}</p>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => setSelectedChat(null)}>
          <X className="text-emerald-950" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;