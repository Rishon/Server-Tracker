import { HiUsers, HiClock } from "react-icons/hi2";

interface SortingControlsProps {
  sortBy: "players" | "uptime";
  setSortBy: (sort: "players" | "uptime") => void;
}

export default function SortingControls({
  sortBy,
  setSortBy,
}: SortingControlsProps) {
  return (
    <div className="flex justify-center mt-8 mb-10 w-full px-4 relative z-10">
      <div className="flex w-full max-w-[360px] sm:w-auto sm:max-w-none sm:inline-flex justify-between items-center bg-black/40 backdrop-blur-md rounded-full p-1 sm:p-1.5 border border-zinc-800 shadow-xl overflow-hidden">
        <button
          onClick={() => setSortBy("players")}
          className={`flex flex-1 sm:flex-none items-center justify-center px-1 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 ease-in-out ${
            sortBy === "players"
              ? "bg-white text-black shadow-md sm:scale-105 sm:my-[-2px]"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <HiUsers className="text-sm sm:text-base mr-1 sm:mr-2" />
          Players
        </button>
        <button
          onClick={() => setSortBy("uptime")}
          className={`flex flex-1 sm:flex-none items-center justify-center px-1 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 ease-in-out mx-0.5 sm:mx-1 ${
            sortBy === "uptime"
              ? "bg-white text-black shadow-md sm:scale-105 sm:my-[-2px]"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <HiClock className="text-sm sm:text-base mr-1 sm:mr-2" />
          Uptime
        </button>
      </div>
    </div>
  );
}
