import React from "react";
import clsx from "clsx";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

const Select: React.FC<SelectProps> = ({ className, children, ...props }) => {
  return (
    <select
      className={clsx(
        "bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#E0E0E0] transition-all",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;