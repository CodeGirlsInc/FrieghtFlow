"use client";
import React, {useEffect, useState} from "react";
import Input from "@/components/ui/Input";
import {FormProvider, useForm, useWatch} from "react-hook-form";
import Button from "@/components/ui/Button";
import Link from "next/link";
// export const metadata = {
//    title: "Sign Up",
//    description: "Sign Up to FreightFlow",
//    robots: {
//       index: false,
//       follow: false,
//    },
// };
export default function SignUp() {
   const [passwordMatch, setPasswordMatch] = useState(true);
   const method = useForm();

   //
   const Confirm_Password = useWatch({control: method.control, name: "Confirm_Password"});
   const Password = useWatch({control: method.control, name: "Password"});

   const onSubmit = (data) => {
      if (Confirm_Password === Password) {
         console.log(data);
         setPasswordMatch(true);
      } else {
         setPasswordMatch(false);
      }
   };

   return (
      <div className="min-h-screen w-full flex flex-row justify-evenly" style={{border: "1px solid red"}}>
         <section className="border hidden lg:flex flex-grow relative">
            {/* <Image src={backgroundimage} height={100} width={100} className="w-[100%] h-[100vh] max-h-[100vh] absolute top-0 bottom-0 right-0 left-0" /> */}
         </section>
         <section className="border w-[470px] xl:w-[634.2px] flex flex-col items-center py-16 px-8 lg:px-14 xl:px-20">
            <div className=" min-h-[547.6px] h-auto w-full space-y-5 ">
               <h1 className="text-[var(--headerText)] font-semibold text-[36px] open_sans">Welcome👋</h1>
               {/*  */}
               <FormProvider {...method}>
                  <form onSubmit={method.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
                     <Input type={"text"} name={"Company_Name"} label={"Company Name"} placeholder={"Company Name"} required={true} ErrorMessage={"Company name is required"} />
                     <Input
                        type={"select"}
                        name={"Business_Type"}
                        label={"Business Type"}
                        placeholder={"Eg Shipper, Carrier, Freight, Broker"}
                        required={true}
                        ErrorMessage={"please select a business type"}
                     />
                     <Input type={"email"} name={"Email"} label={"Email"} placeholder={"Example@gmail.com"} required={true} ErrorMessage={"Email is required!"} />
                     <Input
                        type={"password"}
                        name={"Password"}
                        label={"Password"}
                        placeholder={"Atleast 8 characters"}
                        required={true}
                        ErrorMessage={"Password should be atleast 8 characters"}
                        minLength={8}
                     />
                     <Input
                        type={"password"}
                        name={"Confirm_Password"}
                        label={"Confirm Password"}
                        placeholder={"Atleast 8 characters"}
                        required={true}
                        ErrorMessage={"Password should be atleast 8 characters"}
                        minLength={8}
                     />
                     {passwordMatch ? "" : <span className="text-red-600 text-xs text-left">Passwords does not match</span>}
                     <br />
                     <section className="flex flex-col items-center space-y-12">
                        {" "}
                        <Button type={"submit"} text={"Sign Up"} className={`w-full h-[57px] open_sans rounded-[4.5px] text-[15.6px] `} />
                        <p className="flex gap-1 text-center">
                           Already have an account ?{" "}
                           <Link href={"sign-in"} className="text-blue-600">
                              Sign In
                           </Link>
                        </p>
                     </section>
                  </form>
               </FormProvider>
            </div>
         </section>
      </div>
   );
}
