import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#252525] border-2 border-[#4A4A4A] p-4 rounded-md max-w-md w-full">
        <button
          onClick={onClose}
          className="float-right text-[#D1D1D1] hover:text-[#EF5350] text-lg font-bold"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;