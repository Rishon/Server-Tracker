// Next.js
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#0f0f10] p-3 border-t border-[#2f2f2f] z-20 flex items-center justify-center">
      <div className="flex items-center justify-between flex-wrap">
        <div className="block lg:hidden"></div>
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <code className="text-sm text-gray-400 text-center lg:text-left items-center lg:justify-center flex flex-col lg:flex-row">
            <span className="mb-2 lg:mb-0">Server Tracker</span>
            <span className="lg:border-l lg:border-gray-400 lg:mx-2 lg:h-2.5 lg:inline-block"></span>
            <span>
              Made with <span className="text-red">❤️</span> by{" "}
              <Link href="https://rishon.systems" target="_blank">
                rishon.systems
              </Link>
            </span>
          </code>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
