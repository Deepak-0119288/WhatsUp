import React, { useState } from "react";
import { useChat } from "../data/useChat";
import { useAuth } from "../data/useAuth";
import { FaUser, FaUsers, FaEdit } from "react-icons/fa";
import { IoMdArrowBack, IoIosCheckmarkCircle, IoMdCheckmark  } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";

const BASE = import.meta.env.VITE_REACT_APP_SOCKET_URL;

export default function Communities() {
  const { createGroup, updateGroup, users, groups } =
    useChat();
  const { authUser } = useAuth();

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupProfilePic, setGroupProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/avatar.png");
  const [editGroup, setEditGroup] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      toast.error("Group name and at least one member are required");
      return;
    }
    console.log("Creating group with:", { groupName, selectedMembers, groupProfilePic });
    createGroup(groupName, selectedMembers, groupProfilePic)
      .then(() => {
        console.log("Group created successfully");
        resetForm();
      })
      .catch((error) => {
        console.error("Error creating group:", error);
        toast.error("Failed to create group");
      });
  };

  const handleEditGroup = (group) => {
    setEditGroup(group);
    setGroupName(group.name);
    setSelectedMembers(group.members.map((m) => m._id || m));
    setPreviewUrl(
      group.profilePic
        ? `${BASE}${group.profilePic}`
        : "/avatar.png"
    );
  };

  const handleUpdateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      toast.error("Group name and at least one member are required");
      return;
    }
    try {
      await updateGroup(
        editGroup._id,
        groupName,
        selectedMembers,
        groupProfilePic
      );
      console.log("Group updated successfully");
      resetForm();
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    }
  };

  const addMember = (userId) => {
    setSelectedMembers((prev) => [...prev, userId]);
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((id) => id !== userId));
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const resetForm = () => {
    setShowGroupForm(false);
    setEditGroup(null);
    setGroupName("");
    setSelectedMembers([]);
    setGroupProfilePic(null);
    setPreviewUrl("/avatar.png");
  };

  const userCreatedGroups = authUser
    ? groups.filter(
        (group) =>
          group.createdBy &&
          group.createdBy.toString() === authUser._id.toString()
      )
    : [];

  return (
    <div className="h-[95vh] w-[450px] bg-white border border-gray-400 border-y-0 mt-6">
      <h2 className="text-2xl text-black font-bold pt-4 pl-4">Groups</h2>
      <div className="flex-1">
        {!showGroupForm && !editGroup ? (
          <div className="h-[calc(95vh-80px)] overflow-y-auto">
            <ul className="py-3">
              <li
                className="w-[450px] border-b px-4 py-3 text-gray-600 hover:bg-gray-200 cursor-pointer flex items-center space-x-2"
                onClick={() => setShowGroupForm(true)}
              >
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 135 90"
                    height="24"
                    width="24"
                    preserveAspectRatio="xMidYMid meet"
                    fill="white"
                  >
                    <title>group-two</title>
                    <path d="M63.282 19.2856C63.282 29.957 54.8569 38.5713 44.3419 38.5713C33.827 38.5713 25.339 29.957 25.339 19.2856C25.339 8.6143 33.827 0 44.3419 0C54.8569 0 63.282 8.6143 63.282 19.2856ZM111.35 22.1427C111.35 31.9446 103.612 39.857 93.954 39.857C84.296 39.857 76.5 31.9446 76.5 22.1427C76.5 12.3409 84.296 4.4285 93.954 4.4285C103.612 4.4285 111.35 12.3409 111.35 22.1427ZM44.3402 51.428C29.5812 51.428 0 58.95 0 73.928V85.714C0 89.25 2.8504 90 6.3343 90H82.346C85.83 90 88.68 89.25 88.68 85.714V73.928C88.68 58.95 59.0991 51.428 44.3402 51.428ZM87.804 52.853C88.707 52.871 89.485 52.886 90 52.886C104.759 52.886 135 58.95 135 73.929V83.571C135 87.107 132.15 90 128.666 90H95.854C96.551 88.007 96.995 85.821 96.995 83.571L96.75 73.071C96.75 63.51 91.136 59.858 85.162 55.971C83.772 55.067 82.363 54.15 81 53.143C80.981 53.123 80.962 53.098 80.941 53.07C80.893 53.007 80.835 52.931 80.747 52.886C82.343 52.747 85.485 52.808 87.804 52.853Z"></path>
                  </svg>
                </div>
                <span>New Group</span>
              </li>
            </ul>
            {userCreatedGroups.length > 0 ? (
              userCreatedGroups.map((group) => (
                <div
                  key={group._id}
                  className="w-full p-3 flex items-center justify-between gap-3 hover:bg-slate-200 transition-colors border-b"
                >
                  <div className="flex items-center gap-3">
                    {group.profilePic ? (
                      <img
                        src={`${BASE}${group.profilePic}`}
                        alt={group.name}
                        className="size-12 object-cover rounded-full"
                      />
                    ) : (
                      <div className="size-12 flex items-center justify-center rounded-full bg-gray-300">
                        <FaUsers className="text-gray-600 text-2xl" />
                      </div>
                    )}
                    <div className="text-left min-w-0">
                      <div className="font-medium truncate text-black">
                        {group.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {group.members.length} members
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="text-gray-600 hover:text-emerald-600"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No groups created yet
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white h-[508px] mt-10">
            <button
              onClick={resetForm}
              className="ml-1 text-xl text-black rounded"
            >
              <IoMdArrowBack className="size-7" />
            </button>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Group Profile"
                  className="size-32 rounded-full object-cover border-4 border-slate-400"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full cursor-pointer hover:scale-105 transition-all"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
            <div className="text-center mt-2">
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-80 p-1 mt-2 mb-2 outline-none border-emerald-600 border-b-2 text-[15px] text-black bg-white"
              />
            </div>
            <div className="overflow-y-auto h-[300px] mb-2 mt-2 ml-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-1 hover:bg-slate-200 border-b pb-2 mt-4"
                >
                  <span className="text-black flex flex-row items-center gap-3">
                    <div className="relative">
                      {user.profilePic ? (
                        <img
                          src={`${BASE}${user.profilePic}`}
                          alt={user.name}
                          className="size-8 object-cover rounded-full"
                        />
                      ) : (
                        <div className="size-8 flex items-center justify-center rounded-full bg-gray-300">
                          <FaUser className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-medium truncate text-black">
                        {user.name}
                      </div>
                    </div>
                  </span>
                  {editGroup ? (
                    selectedMembers.includes(user._id) ? (
                      <button
                        onClick={() => removeMember(user._id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 mr-5"
                      >
                        <RxCross2 />
                        <span className="text-sm">Remove</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => addMember(user._id)}
                        className="text-emerald-500 hover:text-emerald-700 flex items-center gap-1 mr-8"
                      >
                        <IoMdCheckmark />
                        <span className="text-sm">Select</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => toggleMemberSelection(user._id)}
                      className="text-emerald-500 hover:text-emerald-700 flex items-center gap-1 mr-8"
                    >
                      {selectedMembers.includes(user._id) && (
                        <IoMdCheckmark />
                      )}
                      <span className="text-sm">Select</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="ml-48">
              <button
                onClick={editGroup ? handleUpdateGroup : handleCreateGroup}
                className="pt-2 text-3xl text-emerald-700 rounded"
              >
                <IoIosCheckmarkCircle className="size-14" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}