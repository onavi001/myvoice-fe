
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
  const baseStyles = "inline-flex items-center justify-center gap-2 min-h-11 px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  const variantStyles = {
    primary: "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-strong)]",
    secondary: "bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-1)] hover:bg-[var(--surface-2)]",
    danger: "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-strong)]",
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