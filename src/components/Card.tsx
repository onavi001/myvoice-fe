import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void; // Para manejar clics en el Card si es necesario
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div
      className={`bg-[var(--surface-1)] border border-[var(--border-1)] rounded-xl shadow-sm overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;