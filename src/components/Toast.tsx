import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-2 rounded-md text-white ${type === "success" ? "bg-[#34C759]" : "bg-[#EF5350]"}`}>
      {message}
      <button onClick={onClose} className="ml-2">×</button>
    </div>
  );
};

export default Toast;