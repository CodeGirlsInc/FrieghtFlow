"use client"
import React from "react";

export default function SubmitButton({ onClick, type, disabled }) {

  return (
    <button onClick={onClick} type={type} disabled={disabled} className="h-[48px] w-[250px] bg-[#1150AB] text-white font-[400] text-[16px] rounded-[8px]">Sign in</button>
  );
}
