import React from "react";

interface TextareaProps {
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({ name, placeholder, value, onChange, className }) => {
  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full p-2 bg-[#1A1A1A] border border-[#4A4A4A] rounded text-white text-xs placeholder-[#B0B0B0] focus:outline-none focus:ring-1 focus:ring-[#34C759] ${className}`}
    />
  );
};

export default Textarea;