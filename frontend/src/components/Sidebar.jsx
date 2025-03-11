import { useState } from "react";
import { MdMessage } from "react-icons/md";
import { MdNoteAdd } from "react-icons/md";
import { MdOutlineLiveTv } from "react-icons/md";
import { MdGroups } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";

export default function Sidebar({ onPageClick }) {
  const [activePage, setActivePage] = useState("");

  const handlePageClick = (page) => {
    setActivePage(page);
    onPageClick(page);
  };

  const menuItems = [
    { id: "chats", icon: MdMessage, label: "Chats" },
    { id: "Notes", icon: MdNoteAdd, label: "Notes" },
    { id: "channels", icon: MdOutlineLiveTv, label: "Channels" },
    { id: "Groups", icon: MdGroups, label: "Groups" },
  ];

  const bottomItems = [
    { id: "settings", icon: IoMdSettings, label: "Settings" },
    { id: "profile", icon: FaUserCircle, label: "Profile" },
  ];

  return (
    <div className="h-auto md:h-[95vh] w-full md:w-[70px] bg-[#e9edef] flex flex-row md:flex-col justify-between mt-0 md:mt-6 ml-0 md:ml-10">
      <div className="flex flex-row md:flex-col items-center space-x-4 md:space-x-0 md:space-y-6 p-4 md:mt-4">
        {menuItems.map(({ id, icon: Icon, label }) => (
          <div
            key={id}
            className={`relative group cursor-pointer flex items-center justify-center w-12 h-12 rounded-full transition duration-200 ${
              activePage === id ? "bg-slate-300" : "hover:bg-slate-300"
            }`}
          >
            <Icon
              className={`w-[28px] h-[32px] transition duration-200 ${
                activePage === id
                  ? "text-green-500"
                  : "text-[#54656f] group-hover:text-green-500"
              }`}
              onClick={() => handlePageClick(id)}
            />
            <span className="absolute left-1/2 md:-left-15 top-10 md:top-10 -translate-x-1/2 md:translate-x-0 bg-black text-white px-3 py-1 text-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-row md:flex-col items-center space-x-4 md:space-x-0 md:space-y-4 p-4 md:mb-4">
        {bottomItems.map(({ id, icon: Icon, label }) => (
          <div
            key={id}
            className={`relative group cursor-pointer flex items-center justify-center w-12 h-12 rounded-full transition duration-200 ${
              activePage === id ? "bg-slate-300" : "hover:bg-slate-300"
            }`}
            onClick={() => handlePageClick(id)}
          >
            <Icon
              className={`w-[28px] h-[32px] transition duration-200 ${
                activePage === id
                  ? "text-green-500"
                  : "text-[#54656f] group-hover:text-green-500"
              }`}
            />
            <span className="absolute left-1/2 md:-left-15 top-10 md:top-10 -translate-x-1/2 md:translate-x-0 bg-black text-white px-3 py-1 text-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
