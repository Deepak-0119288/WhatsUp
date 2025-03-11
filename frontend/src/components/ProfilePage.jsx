import { useState } from "react";
import { Pencil, Camera } from "lucide-react";
import { useAuth } from "../data/useAuth";
import toast from "react-hot-toast";

const BASE = import.meta.env.VITE_REACT_APP_SOCKET_URL;

export default function ProfilePage() {
  const { authUser, updateProfile } = useAuth();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      e.target.value = "";
      return;
    }

    setSelectedImg(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profilePic", file);

    await updateProfile(formData);
  };

  return (
    <div className="h-[95vh] w-full md:w-[450px] bg-white border border-gray-400 border-y-0 mt-6">
      <h1 className="text-black text-2xl p-6 font-bold">Profile</h1>

      <div className="w-full md:w-[450px] bg-gray-100">
        <div className="w-[450px] border-t border-b p-6 space-y-8">
          <div className="text-center">
            <p className="mt-2">Your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={
                  selectedImg ||
                  (authUser?.profilePic
                    ? `${BASE}${authUser.profilePic}`
                    : "/avatar.png")
                }
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-slate-400"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200"
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              Click the camera icon to update your photo
            </p>
          </div>
        </div>
      </div>

      <div className="pl-5 pb-10 mt-12 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-emerald-600 text-sm">Your name</label>
            <p className="text-black py-2.5 rounded-lg">{authUser?.name}</p>
          </div>
          <button className="pr-4 rounded-full transition-colors">
            <Pencil className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="pb-4">
          <p className="text-sm text-gray-500">
            This is not your username or PIN. This name will be visible to your
            WhatsApp contacts.
          </p>
        </div>
      </div>

      <div className="pl-5 mt-6 border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-emerald-600 text-sm">About</label>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pr-3 text-black">
          <span>Account Created</span>
          <span className="text-sm">{authUser?.createdAt?.split("T")[0]}</span>
        </div>
        <div className="flex items-center justify-between mt-2 pr-2">
          <span className="text-black">Account Status</span>
          <span className="text-green-500 mr-2">Active</span>
        </div>
      </div>
    </div>
  );
}
