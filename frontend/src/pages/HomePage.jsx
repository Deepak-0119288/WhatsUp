import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import LowerChat from "../components/lowerChat";
import NotesPage from "../components/NotesPage";
import ChannelsPage from "../components/ChannelsPage";
import GroupPage from "../components/GroupPage";
import SettingsPage from "../components/SettingsPage";
import ProfilePage from "../components/ProfilePage";
import ChatWindow from "../components/ChatWindow";

const HomePage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activePage, setActivePage] = useState("chats");

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  const handlePageSelection = (page) => {
    setActivePage(page);
    if (page !== "chats") {
      setSelectedChat(null); 
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "chats":
        return <LowerChat onChatClick={handleChatClick} />;
      case "Notes":
        return <NotesPage />;
      case "channels":
        return <ChannelsPage />;
      case "Groups":
        return <GroupPage />;
      case "settings":
        return <SettingsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <LowerChat onChatClick={handleChatClick} />;
    }
  };

  return (
    <div className="flex flex-row h-[100vh] w-[100vh]">
      <Sidebar onPageClick={handlePageSelection} />
      <div>{renderPage()}</div>
      <ChatWindow selectedChatData={selectedChat} />
    </div>
  );
};

export default HomePage;