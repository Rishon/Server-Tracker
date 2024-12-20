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

// Context
import { useGraphColor } from "@/contexts/GraphColorContext";

const Navbar = () => {
  // Navigation
  const currentPage = usePathname();
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Current graph color
  const { graphColor, setGraphColor } = useGraphColor();

  // Snackbar
  const [notification, setNotification] = useState<string | null>(null);
  const [snackbarType, setSnackbarType] = useState<"success" | "error">(
    "success"
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
  }, []);

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

      <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between bg-[#0f0f10] p-4 border-b border-[#2f2f2f]">
        <div className="flex items-center flex-shrink-0 text-white space-x-4">
          <Link href="/" className="font-semibold text-2xl tracking-tight">
            <Image
              src="/assets/icon.webp"
              width={25}
              height={25}
              alt="Server Tracker"
            />
          </Link>
          <div className="flex lg:flex lg:items-center ml-auto space-x-4">
            {links.map((link) => (
              <Link key={link.path} href={link.path} target={link.target}>
                <p
                  className={`text-md ${
                    currentPage === link.path
                      ? "text-white-500 cursor-pointer"
                      : "hover:text-white text-gray-700 cursor-pointer"
                  }`}
                >
                  {link.label}
                </p>
              </Link>
            ))}

            <MdOutlineInvertColors
              className="text-2xl cursor-pointer"
              style={{ color: graphColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
          </div>
        </div>

        {showColorPicker && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#0f0f10] p-8 rounded-md shadow-lg border border-[#2f2f2f] w-[90%] max-w-md space-y-6 text-center">
              <h3 className="text-lg font-semibold">Select a Graph Color</h3>

              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-6">
                  {graphColors.map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-full cursor-pointer"
                      style={{
                        backgroundColor: color,
                        border:
                          color === graphColor ? "2px solid #E5E1DA" : "none",
                      }}
                      onClick={() => {
                        setColor(color);
                        sendSnackbar(
                          "Graph Color has been updated!",
                          "success"
                        );
                      }}
                    />
                  ))}
                </div>
              </div>

              <input
                type="text"
                className="w-full py-2 px-4 bg-gray-800 text-white rounded-md"
                placeholder={graphColor}
                onChange={(e) => {
                  if (!/^#[0-9A-F]{6}$/i.test(e.target.value)) return;
                  setColor(e.target.value);
                }}
              />

              <button
                className="py-2 mt-4 bg-gray-800 text-white rounded-md w-full hover:bg-gray-700 transition-all duration-200 ease-in-out"
                onClick={() => setShowColorPicker(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </nav>
    </main>
  );
};

export default Navbar;
