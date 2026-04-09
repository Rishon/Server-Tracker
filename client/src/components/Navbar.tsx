// Next.js
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// React
import { useEffect, useState } from "react";
import { HiCog6Tooth, HiClock, HiUsers, HiXMark } from "react-icons/hi2";

// Cache
import { setCache, getCache } from "@/data/Cache";

// Components
import Snackbar from "@/components/Snackbar";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

// Context
import { useGraphColor } from "@/contexts/GraphColorContext";
import { useCurrentList } from "@/contexts/CurrentListContext";
import { useSortBy } from "@/contexts/SortByContext";

const Navbar = () => {
  // Navigation
  const currentPage = usePathname();
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);

  // Current graph color
  const { graphColor, setGraphColor } = useGraphColor();
  const { sortBy, setSortBy } = useSortBy();

  // Current list
  const { currentList, setCurrentList } = useCurrentList();

  // Snackbar
  const [notification, setNotification] = useState<string | null>(null);
  const [snackbarType, setSnackbarType] = useState<"success" | "error">(
    "success",
  );
  const [showSnackbar, setShowSnackbar] = useState(false);

  const closeSnackbar = () => {
    setShowSnackbar(false);
    setNotification(null);
  };

  const links = [
    { path: "/", label: "Home" },
    {
      path: "https://github.com/Rishon/Server-Tracker/blob/master/server/servers.json",
      label: "Suggest Server",
      target: "_blank",
    },
  ];

  const graphColors = [
    "#32D67A",
    "#DA498D",
    "#A294F9",
    "#80C4E9",
    "#FF4545",
    "#FCF596",
    "#AB886D",
    "#387478",
    "#0B2F9F",
  ];

  useEffect(() => {
    const cachedGraphColor = getCache("graphColor");
    if (cachedGraphColor) setGraphColor(cachedGraphColor);
  }, [setGraphColor]);

  function setColor(color: string) {
    setCache("graphColor", color);
    setGraphColor(color);
  }

  function sendSnackbar(message: string, type: "success" | "error") {
    setNotification(message);
    setSnackbarType(type);
    setShowSnackbar(true);
  }

  return (
    <main>
      {showSnackbar && (
        <Snackbar
          message={notification || ""}
          type={snackbarType}
          onClose={closeSnackbar}
        />
      )}

      <nav
        className="fixed top-4 left-1/2 z-30 w-[95%] max-w-6xl -translate-x-1/2
  rounded-2xl border border-white/10
  bg-[#0f0f10]/80 backdrop-blur-xl shadow-lg px-6 py-3"
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/icon.webp"
              width={28}
              height={28}
              alt="Server Tracker"
              className="rounded-md"
            />
            <span className="hidden sm:block text-lg font-semibold tracking-tight">
              Server Tracker
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                target={link.target}
                className={`relative text-sm font-medium transition-colors
            ${
              currentPage === link.path
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
              >
                {link.label}
                {currentPage === link.path && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-white rounded-full" />
                )}
              </Link>
            ))}

            <Link
              href="https://zeraph.app"
              target="_blank"
              className="group relative flex items-center gap-1.5 px-4 py-1.5 
              rounded-full text-sm font-bold transition-all duration-300
              text-[#f0cd31] hover:text-[#f7e07a] active:scale-95
              bg-[#f0cd31]/5 border border-[#f0cd31]/30 hover:border-[#f0cd31]/60
              shadow-[0_0_15px_-3px_rgba(240,205,49,0.2)] hover:shadow-[0_0_25px_-3px_rgba(240,205,49,0.5)]"
            >
              <span className="relative z-10">Protect your server</span>
              <div className="absolute inset-0 rounded-full bg-[#f0cd31]/5 blur-md transition-opacity opacity-0 group-hover:opacity-100" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next =
                  currentList === "minecraft" ? "hytale" : "minecraft";
                setCurrentList(next);
                sendSnackbar(
                  `${next.charAt(0).toUpperCase() + next.slice(1)} server list selected!`,
                  "success",
                );
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-center justify-center w-[40px] h-[40px]"
            >
              <div className="relative w-[20px] h-[20px]">
                <Image
                  src={
                    currentList === "minecraft"
                      ? "/assets/games/minecraft.webp"
                      : "/assets/games/hytale.webp"
                  }
                  fill
                  alt="Game Toggle"
                  className="object-contain"
                  sizes="20px"
                />
              </div>
            </button>

            <button
              onClick={() => setShowSettingsPopup(!showSettingsPopup)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-center justify-center w-[40px] h-[40px]"
              aria-label="Open settings"
            >
              <HiCog6Tooth className="text-xl text-gray-200" />
            </button>
          </div>
        </div>

        {currentList === "hytale" && (
          <div
            className="mt-3 flex items-center gap-2 rounded-xl
    border border-orange-400/20
    bg-orange-500/10 px-4 py-2
    text-sm text-orange-300
    backdrop-blur-md"
          >
            <HiOutlineExclamationTriangle className="text-base shrink-0" />
            <span>
              Hytale servers require the
              <Link
                href={
                  "https://github.com/HytaleOne/hytale-one-query-plugin/releases"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="mx-1 rounded bg-orange-400/20 px-1.5 py-0.5 font-mono text-orange-200">
                  HytaleOne Query Plugin
                </span>
              </Link>
              mod for queries to function correctly.
            </span>
          </div>
        )}
      </nav>

      {showSettingsPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setShowSettingsPopup(false)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/95 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/5 blur-[80px]" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-xl font-bold text-transparent tracking-tight">
                Preferences
              </h3>
              <button
                onClick={() => setShowSettingsPopup(false)}
                className="rounded-full p-2 text-gray-500 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Color Section */}
              <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-left">
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Graph Color
                </h4>
                
                <div className="mb-5 flex flex-wrap justify-center gap-3">
                  {graphColors.map((color) => (
                    <button
                      key={color}
                      className={`h-9 w-9 rounded-full transition-all duration-200 ease-out hover:scale-110 active:scale-95
                        ${color === graphColor ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setColor(color);
                        sendSnackbar("Graph color updated!", "success");
                      }}
                    />
                  ))}
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <div 
                      className="h-4 w-4 rounded border border-white/20 shadow-sm" 
                      style={{ backgroundColor: graphColor }} 
                    />
                  </div>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none transition placeholder:text-gray-600 focus:border-white/30 focus:ring-1 focus:ring-white/30"
                    placeholder={graphColor}
                    onChange={(e) => {
                      if (!/^#[0-9A-F]{6}$/i.test(e.target.value)) return;
                      setColor(e.target.value);
                    }}
                  />
                </div>
              </section>

              {/* Sort Section */}
              <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-left">
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Sort Servers By
                </h4>
                <div className="flex w-full items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-black/50 p-1 shadow-inner">
                  <button
                    onClick={() => setSortBy("players")}
                    className={`flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      sortBy === "players"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <HiUsers className="mr-2 text-sm sm:text-base" />
                    Players
                  </button>
                  <button
                    onClick={() => setSortBy("uptime")}
                    className={`flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      sortBy === "uptime"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <HiClock className="mr-2 text-sm sm:text-base" />
                    Uptime
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Navbar;
