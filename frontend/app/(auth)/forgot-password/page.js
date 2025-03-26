"use client";
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPassword() {
  const methods = useForm();
  
  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left side with background image - hidden on mobile, visible on md screens and up */}
      <div className="hidden md:block bg-[url('/backgroundimage.svg')] bg-cover bg-center h-full md:flex-1 bg-black/40 bg-blend-overlay"></div>
      
      {/* Right side with form - full width on mobile, fixed width on larger screens */}
      <div className="h-full w-full md:w-[634.2px] bg-white flex flex-col justify-center items-center px-4 md:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-8 text-center md:text-left">Reset Password</h1>
          
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 md:gap-6 w-full"
            >
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your new password"
                required
                minLength={6}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
              <div className="mt-4">
                <Button type="submit" text="Reset Password" />
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}