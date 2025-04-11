import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void; // Para manejar clics en el Card si es necesario
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div
      className={`bg-[#2D2D2D] rounded-lg shadow-sm overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;