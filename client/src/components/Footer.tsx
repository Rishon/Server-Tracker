const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#0f0f10] p-3 border-t border-[#2f2f2f] z-20">
      <div className="flex items-center justify-between flex-wrap">
        <div className="block lg:hidden"></div>
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <div className="text-m text-gray-400 text-center lg:text-left">
            Tracker © 2024
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
