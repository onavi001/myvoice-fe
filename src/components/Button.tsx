
import React, { ButtonHTMLAttributes } from "react";
import { ariaLabel, ariaRole } from "../utils/a11y";
import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "outlineDanger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaRole?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-strong)] border border-[var(--color-accent-strong)]",
  secondary:
    "bg-[var(--surface-2)] text-[var(--text-primary)] border-2 border-[#5A5A5A] hover:bg-[#383838] active:bg-[#404040]",
  danger:
    "bg-[var(--color-danger)] text-white border border-[var(--color-danger-strong)] hover:bg-[var(--color-danger-strong)]",
  outline:
    "bg-[var(--surface-2)] text-[var(--text-primary)] border-2 border-[#5A5A5A] hover:bg-[#383838] active:bg-[#404040]",
  outlineDanger:
    "bg-[#2a2a2a] text-[#FF8A80] border-2 border-[#EF5350] hover:bg-[#3d2a2a] active:bg-[#4a3232]",
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
  ariaLabel: label,
  ariaRole: role,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 min-h-11 px-3 py-2 rounded-lg text-sm font-semibold transition-colors touch-manipulation",
        variantStyles[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...ariaLabel(label || (typeof children === "string" ? children : ""))}
      {...ariaRole(role || "button")}
      {...props}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);
