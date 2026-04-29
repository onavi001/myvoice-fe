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
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

const Input: React.FC<InputProps> = ({ name, type = "text", placeholder, value, onChange, className, ref, required, disabled, min, max, step}) => {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full min-h-11 p-2.5 bg-[var(--surface-0)] border border-[var(--border-1)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${className || ""}`}
      ref={ref}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      aria-label={placeholder || name}
      role="textbox"
    />
  );
};

export default React.memo(Input);