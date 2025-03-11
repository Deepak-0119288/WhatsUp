import {
  Search,
  User,
  Lock,
  MessageSquare,
  Bell,
  Keyboard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "../data/useAuth";

export default function SettingsPage() {
  const { logout, authUser } = useAuth();

  return (
    <div className="h-[97vh] w-full md:w-[450px] bg-white border border-gray-400 border-y-0 mt-6 flex flex-col overflow-hidden">
      <div className="p-6 border-b shrink-0 text-black">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-black">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search settings"
            className="w-full bg-gray-100 rounded-md pl-10 pr-4 py-2 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-black py-2.5 rounded-lg">{authUser?.name}</p>
          </div>
        </div>

        <nav className="space-y-1">
          <button className="w-full flex items-center space-x-3 px-2 py-3 rounded-md hover:bg-gray-100 transition-colors">
            <User className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700">Account</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-2 py-3 rounded-md hover:bg-gray-100 transition-colors">
            <Lock className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700">Privacy</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-2 py-3 rounded-md hover:bg-gray-100 transition-colors">
            <MessageSquare className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700">Chats</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-2 py-3 rounded-md hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700">Notifications</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-2 py-3 rounded-md hover:bg-gray-100 transition-colors">
            <Keyboard className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700">Keyboard shortcuts</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-2 py-3 rounded-md hover:bg-gray-100 transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700">Help</span>
          </button>

          <button
            className="w-full flex items-center space-x-3 px-2 py-3 rounded-md hover:bg-gray-100 transition-colors"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="text-red-500">Log out</span>
          </button>
        </nav>
      </div>
    </div>
  );
}