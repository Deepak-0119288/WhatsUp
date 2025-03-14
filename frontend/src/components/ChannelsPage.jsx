import { Plus } from "lucide-react";

export default function ChannelsPage() {
  const Channels = [
    {
      id: 1,
      name: "WhatsApp",
      followers: "223.4M followers",
      imageUrl: "/w3.png",
      verified: true,
    },
    {
      id: 2,
      name: "TV9 Telugu",
      followers: "6.5M followers",
      imageUrl: "/download.jpg",
      verified: true,
    },
    {
      id: 3,
      name: "நிலா சமையல்",
      followers: "5M followers",
      imageUrl: "/telgu.jpg",
      verified: true,
    },
    {
      id: 4,
      name: "Cravings",
      followers: "9.4M followers",
      imageUrl: "/cravings.jpg",
      verified: true,
    },
    {
      id: 5,
      name: "Aaj Tak",
      followers: "23.6M followers",
      imageUrl: "/aajtak.jpg",
      verified: true,
    },
  ];

  return (
    <div className="h-[97vh] w-full md:w-[450px] bg-white border border-gray-400 border-y-0 mt-6 flex flex-col overflow-hidden">
      <div className="p-6 border-b shrink-0">
        <div className="flex items-center text-black justify-between">
          <h1 className="text-2xl font-bold">Channels</h1>
          <button className="p-2 hover:bg-slate-300 rounded-full transition duration-200">
            <Plus className="h-5 w-5 text-green-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 text-black">
        <div className="text-center text-slate-500 mb-8">
          <h2 className="text-lg font-medium mb-1">
            Stay updated on your favorite topics
          </h2>
          <p className="text-gray-500">Find channels to follow below</p>
        </div>

        <div className="space-y-6">
          {Channels.map((channel) => (
            <div key={channel.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                  {channel.imageUrl ? (
                    <img
                      src={channel.imageUrl || "/placeholder.svg"}
                      alt={channel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{channel.imageUrl}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{channel.name}</span>
                    {channel.verified && (
                      <svg
                        className="w-4 h-4 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{channel.followers}</p>
                </div>
              </div>
              <button className="px-4 py-1 text-emerald-600 font-medium border border-gray-300 rounded-full hover:bg-gray-50">
                Follow
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <button className="w-[150px] mt-8 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition duration-200">
            Discover more
          </button>
        </div>
      </div>
    </div>
  );
}