const Sidebar = ({
  isOpen,
  toggleSidebar,
}: Readonly<{ isOpen: boolean; toggleSidebar: () => void }>) => {
  return (
    <div
      className={`fixed h-full w-64 bg-[#0f0f10] border-t border-[#2f2f2f] p-4 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-10 lg:translate-x-0`}
    >
      <div className="lg:hidden p-4">
        <button onClick={toggleSidebar} className="text-white">
          ✕
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
