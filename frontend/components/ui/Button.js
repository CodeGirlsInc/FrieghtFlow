import { cn } from "@/lib/utils";
import React from "react";

const Button = ({
  type = "submit",
  onclick,
  text,
  className = "",
  disabled,
}) => {
  return (
    <button
      type={type}
      onClick={onclick}
      disabled={disabled}
      className={cn(
        `w-full py-4 px-6 bg-[#B57704] text-white text-center rounded-[20px] font-medium text-xl hover:bg-[#956811] transition-colors`,
        className
      )}
    >
      {text}
    </button>
  );
};

export default Button;
