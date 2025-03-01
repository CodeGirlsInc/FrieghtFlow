"use client";
import React, { useState } from "react";
import SubmitButton from "./Button";
import { useFormik } from "formik";
import { signInSchema } from "@/lib/validation-schemas/sign-in-schema";

export default function SigninForm() {
  const [shake, setShake] = useState({ email: false, password: false });

  const onSubmit = async (values) => {
    console.log("Sign in values", values);
  };

  const {
    handleSubmit,
    setFieldValue,
    errors,
    values,
    handleBlur,
    touched,
  } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: signInSchema,
    onSubmit,
  });

  const handleShake = (field) => {
    setShake((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setShake((prev) => ({ ...prev, [field]: false }));
    }, 500);
  };

  return (
    <form className="flex flex-col gap-[15px]">
      <div className="flex flex-col">
        <label htmlFor="Email" className="font-[400] text-[12px] py-[4px] text-[#565A65]">
          Email
        </label>
        <input
          value={values.email}
          onChange={({ target }) => setFieldValue("email", target.value)}
          onBlur={(e) => {
            handleBlur(e);
            if (errors.email) handleShake("email");
          }}
          type="email"
          placeholder="Enter your Email"
          className={`focus:outline-none text-[400] text-[16px] border-b-[1px] border-[#B6BFD9] ${
            errors.email && touched.email ? "border-red-500 shake" : ""
          }`}
        />
        {errors.email && touched.email && (
          <p className="text-red-500 text-[12px] mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="flex flex-col mb-4">
        <div className="flex flex-row items-center justify-between py-[4px]">
          <label htmlFor="Password" className="font-[400] text-[12px] text-[#565A65]">
            Password
          </label>
          <p className="font-[400] text-[12px] text-[#565A65] cursor-pointer">
            Forgot Password
          </p>
        </div>
        <input
          value={values.password}
          onChange={({ target }) => setFieldValue("password", target.value)}
          onBlur={(e) => {
            handleBlur(e);
            if (errors.password) handleShake("password");
          }}
          type="password"
          placeholder="Enter your Password"
          className={`focus:outline-none text-[400] text-[16px] border-b-[1px] border-[#B6BFD9] ${
            errors.password && touched.password ? "border-red-500 shake" : ""
          }`}
        />
        {errors.password && touched.password && (
          <p className="text-red-500 text-[12px] mt-1">{errors.password}</p>
        )}
      </div>

      <SubmitButton
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      />

      <style jsx>{`
        .shake {
          animation: shake 0.3s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>
    </form>
  );
}
