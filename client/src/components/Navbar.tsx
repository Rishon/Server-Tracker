// Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";

// React Icons
import { FaBars } from "react-icons/fa";

const Navbar = ({ toggleSidebar }: Readonly<{ toggleSidebar: () => void }>) => {
  // Navigation
  const currentPage = usePathname();

  const links = [
    { path: "/", label: "Home" },
    {
      path: "https://github.com/Rishon/Server-Tracker/blob/master/server/servers.json",
      label: "Suggest Server",
      target: "_blank",
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between bg-[#0f0f10] p-4 border-b border-[#2f2f2f]">
      <div className="flex items-center flex-shrink-0 text-white space-x-4">
        <Link href="/" className="font-semibold text-2xl tracking-tight">
          📈
        </Link>
        <div className="hidden lg:flex lg:items-center ml-auto space-x-4">
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
        </div>
      </div>
      <div className="block lg:hidden">
        <button onClick={toggleSidebar} className="text-white text-xl">
          <FaBars />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
