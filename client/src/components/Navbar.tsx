// Next.js
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// React
import { useEffect, useState } from "react";
import { MdOutlineInvertColors } from "react-icons/md";

// Cache
import { setCache, getCache } from "@/data/Cache";

// Components
import Snackbar from "@/components/Snackbar";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

// Context
import { useGraphColor } from "@/contexts/GraphColorContext";
import { HiOutlineBeaker } from "react-icons/hi";
import { useCurrentList } from "@/contexts/CurrentListContext";

const Navbar = () => {
  // Navigation
  const currentPage = usePathname();
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Current graph color
  const { graphColor, setGraphColor } = useGraphColor();

  // Current list
  const { currentList, setCurrentList } = useCurrentList();

  // Experimental
  const [showExperimental, setShowExperimental] = useState(false);

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

    const cachedExperimental = getCache("experimental");
    if (cachedExperimental) setShowExperimental(cachedExperimental);
  }, [setGraphColor, setShowExperimental]);

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
              <span className="relative z-10">Try Zeraph</span>
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
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              <Image
                src={
                  currentList === "minecraft"
                    ? "/assets/games/minecraft.webp"
                    : "/assets/games/hytale.webp"
                }
                width={22}
                height={22}
                alt="Game Toggle"
              />
            </button>

            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              <MdOutlineInvertColors
                className="text-xl"
                style={{ color: graphColor }}
              />
            </button>

            {/*             <button
              onClick={() => {
                setShowExperimental(!showExperimental);
                setCache("experimental", !showExperimental);
                sendSnackbar(
                  `Experimental Features ${showExperimental ? "disabled" : "enabled"
                  }!`,
                  "success",
                );
              }}
              className={`p-2 rounded-xl transition
          ${showExperimental
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
                }`}
            >
              <HiOutlineBeaker className="text-xl" />
            </button> */}
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

      {showColorPicker && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="w-[90%] max-w-md rounded-2xl border border-white/10
      bg-[#0f0f10] p-6 shadow-xl space-y-6"
          >
            <h3 className="text-lg font-semibold text-center">
              Select Graph Color
            </h3>

            <div className="grid grid-cols-3 gap-4 place-items-center">
              {graphColors.map((color) => (
                <button
                  key={color}
                  className={`h-10 w-10 rounded-full transition transform hover:scale-110
              ${color === graphColor ? "ring-2 ring-white" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setColor(color);
                    sendSnackbar("Graph color updated!", "success");
                  }}
                />
              ))}
            </div>

            <input
              type="text"
              className="w-full rounded-lg bg-white/5 px-4 py-2 text-center
          text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
              placeholder={graphColor}
              onChange={(e) => {
                if (!/^#[0-9A-F]{6}$/i.test(e.target.value)) return;
                setColor(e.target.value);
              }}
            />

            <button
              onClick={() => setShowColorPicker(false)}
              className="w-full rounded-lg bg-white/10 py-2 text-sm
          hover:bg-white/20 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Navbar;
