import React from "react";
import SubmitButton from "./Button";


export default function SigninForm() {

    return (
        <form className=" flex flex-col gap-[15px]">
            <div className="flex flex-col">
                <label htmlFor="Email" className="font-[400] text-[12px] py-[4px] text-[#565A65]">Email</label>
                <input type="email" placeholder="Enter the Email" className="focus:outline-none text-[400] text-[16px] border-b-solid border-b-[1px] border-[#B6BFD9]" />
            </div>
            <div className="flex flex-col mb-4">

                <div className="flex flex-row items-center justify-between py-[4px]">
                    <label htmlFor="Email" className="font-[400] text-[12px] text-[#565A65]">Password</label>
                    <p className="font-[400] text-[12px] text-[#565A65] cursor-pointer">Forgot Password</p>
                </div>
                <input type="password" placeholder="Enter your Password" className="focus:outline-none text-[400] text-[16px] border-b-solid border-b-[1px] border-[#B6BFD9]" />

            </div>
            <SubmitButton />
        </form>
    );
}
