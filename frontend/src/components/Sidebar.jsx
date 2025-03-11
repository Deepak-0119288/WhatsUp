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
    <div className="h-[95vh] w-[70px] mtw-[65px] bg-[#e9edef] flex flex-col justify-between mt-6 ml-10">
      <div className="flex flex-col items-center space-y-6 mt-4">
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
                  ? "text-emerald-600"
                  : "text-[#54656f] group-hover:text-slate-600"
              }`}
              onClick={() => handlePageClick(id)}
            />
            <span className="absolute -left-15 top-10 bg-black text-white px-3 py-1 text-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center space-y-4 mb-4">
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
                  ? "text-emerald-600"
                  : "text-[#54656f] group-hover:text-slate-600"
              }`}
            />
            <span className="absolute -left-15 top-10 bg-black text-white px-3 py-1 text-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}