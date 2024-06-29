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
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div
      className={`fixed bottom-5 right-5 p-4 rounded-md z-50 transition-transform transition-opacity duration-500 ${
        isVisible
          ? "opacity-100 transform"
          : "opacity-0 transform pointer-events-none"
      } ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
    >
      <div className="text-white">{message}</div>
    </div>
  );
};

export default Snackbar;
