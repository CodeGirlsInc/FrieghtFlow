"use client";

import { Button } from "@/components/ui/button";
import { Facebook, FacebookIcon, Icon } from "lucide-react";
import facebook from "@/public/assets/facebook.svg";
import google from "@/public/assets/google.svg";
import Image from "next/image";
// import { Input } from '@/components/ui/input'
// import React from 'react'

// const SignUpInput = () => {
//   return (
   
//     <div className='mt-3'>
//         <Input type="text" placeholder="Your Name" className="placeholder-gray-300 border-b border-b-black border-t-0 border-l-0 border-r-0"/>
//     </div>
//   )
// }

// export default SignUpInput


import React, { useState } from "react";
import Link from "next/link";

const SignupInput = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = () => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <div className="flex flex-col gap-9 mt-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="flex flex-col gap-2 justify-between">
            <label className="block text-sm pl-4 font-medium text-gray-700">
              Your Name
            </label>
            <input 
             value={formData.name}
             onChange={handleChange}
             required
            className="appearance-none bg-transparent border-b  placeholder-[#DADFEB] border-b-[#B6BFD9] w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" 
            type="text" placeholder="Your name"
             aria-label="Full name"/>
            <label className="block text-sm pl-4 font-medium text-gray-700">
            Email
            </label>
            <input 
             value={formData.name}
             onChange={handleChange}
             required
            className="appearance-none bg-transparent border-b placeholder-[#DADFEB] border-b-[#B6BFD9] w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" 
            type="text" placeholder="Enter your Email"
             aria-label="Email"/>
            <label className="block text-sm pl-4 font-medium text-gray-700">
             Password
            </label>
            <input 
             value={formData.name}
             onChange={handleChange}
             required
            className="appearance-none bg-transparent border-b placeholder-[#DADFEB] border-b-[#B6BFD9] w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" 
            type="text" placeholder="At least 8 characters long"
             aria-label="Password"/>
            {/* <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border  border-b-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
              required
            /> */}

      <div className="ml-4 mt-5">
        <p className="text-xs text-gray-500">
            By proceeding, I agree with the{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Privacy & Policy
            </a>
          </p>

        </div>
        <button
            type="submit"
            className="w-full rounded-md bg-[#1150AB] p-3 font-poppins shadow-md text-[16px] mt-2 font-normal text-white leading-[24px] hover:bg-blue-700"
          >
            Create account
          </button>
          <div className="mt-3">
              <div className="flex flex-col gap-2">
                <p className="font-opensans font-normal text-[14px] text-[#565A65] leading-[14.4px] pb-2">Sign up with</p>

                <div className="flex flex-row w-full gap-4 justify-between">
                  <Button className="w-full bg-[#8770FF1A] text-[#565A65]">
                  <Image src={google} alt="google-icon" width={22} height={22}/>
                    Google

                  </Button>
                  <Button className="w-full bg-[#8770FF1A] text-[#565A65]">
                    <Image src={facebook} alt="facebook-icon" width={22} height={22}/>
                    Facebook
                  </Button>
                </div>
                <p className="text-[#565A65] pt-2 font-normal text-[18px] leading-[24px] font-opensans">Already have an account? <Link href="/sign-in" className="hover:underline text-[#1150AB]"> Log in </Link></p>
              </div>
          </div>
          </div>

          {/* Email Field */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter the Email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
              required
            />
          </div> */}

          {/* Password Field */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="At least 8 characters long"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 p-3 text-gray-800 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
              required
            />
          </div> */}

      
        
        </form>
    </div>
  );
};

export default SignupInput;