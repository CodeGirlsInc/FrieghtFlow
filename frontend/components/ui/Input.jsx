"use client";
import React from "react";
import { useForm, useFormContext } from "react-hook-form";

const Input = ({
  type,
  name,
  label,
  placeholder,
  required,
  ErrorMessage,
  minLength,
  list,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const validationRules = {
    required,
  };

  if (type === "password" && minLength) {
    validationRules.minLength = {
      value: minLength,
      message: `Password should be a minimum of ${minLength} characters`,
    };
  }

  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="text-[var(--headerText)] font-[400] open_sans text-[16.56px]"
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        list={list}
        className={`w-full h-[57px] rounded-[4.5px] text-[#8897ad] text-[15.6px] px-4 border-[var(--border)] border-[1.3px] border-solid bg-[var(--inputBackground)] focus:outline-none open_sans font-[400]`}
        placeholder={placeholder}
        {...register(name, validationRules)}
      />
      {errors[name] && (
        <span className="text-xs text-left text-red-600">
          {ErrorMessage || "this field is required"}
        </span>
      )}
    </div>
  );
};

export default Input;
