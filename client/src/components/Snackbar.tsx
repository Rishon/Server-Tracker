import React, { useEffect, useState } from "react";

interface SnackbarProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const closeTimeout = setTimeout(() => {
      setIsVisible(false);
      const removeTimeout = setTimeout(onClose, 500);
      return () => clearTimeout(removeTimeout);
    }, 3000);

    return () => clearTimeout(closeTimeout);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 p-4 rounded-md z-50 transition-all duration-500 ease-in-out transform ${isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-5 pointer-events-none"
        } ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
    >
      <div className="text-white">{message}</div>
    </div>
  );
};

export default Snackbar;
