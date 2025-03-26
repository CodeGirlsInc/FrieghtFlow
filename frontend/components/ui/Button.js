import React from "react";

const Button = ({type, onclick, text, className, disabled}) => {
  return (
      <button type={type} onClick={onclick} disabled={disabled} className={`${className} bg-[#B57704] h-[57.6px] w-full text-white `}>
      {text}
    </button>
   );
};

export default Button;
