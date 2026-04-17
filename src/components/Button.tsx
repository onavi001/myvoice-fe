
import React, { ButtonHTMLAttributes } from "react";
import { ariaLabel, ariaRole } from "../utils/a11y";
type ButtonVariant = "primary" | "secondary" | "danger";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaRole?: string;
}


const Button: React.FC<ButtonProps> = ({ children, onClick, variant = "primary", disabled, className = "", ariaLabel: label, ariaRole: role, ...props }) => {
  const baseStyles = " py-2 rounded text-xs font-medium transition-colors";
  const variantStyles = {
    primary: "bg-[#34C759] text-black hover:bg-[#2DBF4E]",
    secondary: "bg-white text-black hover:bg-[#E0E0E0]",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variantStyles[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className} ${baseStyles}`}
      {...ariaLabel(label || (typeof children === "string" ? children : ""))}
      {...ariaRole(role || "button")}
      {...props}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);