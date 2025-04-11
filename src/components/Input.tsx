import React from "react";

interface InputProps {
  name: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  ref?: React.Ref<HTMLInputElement>
  required?: boolean;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({ name, type = "text", placeholder, value, onChange, className, ref, required, disabled }) => {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full p-2 bg-[#1A1A1A] border border-[#4A4A4A] rounded text-white text-xs placeholder-[#B0B0B0] focus:outline-none focus:ring-1 focus:ring-[#34C759] ${className}`}
      ref={ref}
      required={required}
      disabled={disabled}
    />
  );
};

export default Input;