// export const metadata = {
//   title: "Sign Up",
//   description: "Sign Up to FreightFlow",
//   robots: {
//     index: false,
//     follow: false,
//   },
// };
// export const metadata = {
//   title: "Sign Up",
//   description: "Sign Up to FreightFlow",
//   robots: {
//     index: false,
//     follow: false,
//   },
// };

"use client";

import React from "react";
import Input from "@/components/ui/Input";
import { useForm, FormProvider } from "react-hook-form";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import backgroundImage from "@/public/backgroundimage.svg";
import SocialAuthButton from "@/components/ui/SocialAuthButton";

export default function SignIn() {
  const methods = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row justify-evenly">
      <section className="lg:flex-grow relative">
        {/* Mobile view - smaller image */}
        <div className="sm:hidden w-full h-[201px] relative rounded-t-sm overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-[#00000085]/50 z-40"></div>
          <Image
            src={backgroundImage}
            layout="fill"
            objectFit="cover"
            alt="Freight container ship illustration"
            className="z-0"
          />
        </div>

        {/* Tablet view  of the image */}
        <div className="hidden sm:block lg:hidden w-full h-[400px] relative rounded-t-sm overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-[#00000085]/50 z-40"></div>
          <Image
            src={backgroundImage}
            layout="fill"
            objectFit="cover"
            alt="Freight container ship illustration"
            className="z-0"
          />
        </div>

        {/* Desktop view of  image */}
        <div className="hidden lg:block absolute top-0 bottom-0 left-0 right-0">
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-[#00000085]/50 z-40"></div>
          <Image
            src={backgroundImage}
            layout="fill"
            objectFit="cover"
            alt="Freight container ship illustration"
            className="z-0"
          />
        </div>
      </section>

      {/* Right section with the form */}
      <section className="w-full lg:w-[470px] xl:w-[634.2px] flex flex-col items-center py-8 lg:py-16 px-8 lg:px-14 xl:px-20">
        <div className="min-h-[547.6px] h-auto w-full space-y-5">
          <div className="space-y-2 mb-5">
            <h1 className="text-[var(--headerText)] font-semibold text-[36px] open_sans">
              Welcome 👋
            </h1>
            <p className="text-gray-600 text-base">
              Every load, every mile. Sign in to streamline your freight and
              logistics management.
            </p>
          </div>

          {/* Form section */}
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="flex flex-col space-y-4 mt-6"
            >
              <Input
                type="email"
                name="Email"
                label="Email"
                placeholder="Example@email.com"
                required={true}
                ErrorMessage="Email is required!"
              />

              <Input
                type="password"
                name="Password"
                label="Password"
                placeholder="At least 8 characters"
                required={true}
                ErrorMessage="Password should be at least 8 characters"
                minLength={8}
              />

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-blue-600 text-sm">
                  Forgot Password?
                </Link>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  text="Sign in"
                  className="w-full h-[57px] open_sans rounded-[4.5px] text-[15.6px] bg-amber-600 hover:bg-amber-700"
                />
              </div>

              {/* Or divider */}
              <div className="flex items-center justify-center my-4">
                <div className="border-t border-gray-300 flex-grow"></div>
                <span className="px-4 text-gray-500">Or</span>
                <div className="border-t border-gray-300 flex-grow"></div>
              </div>

              {/* Social authentication buttons */}
              <div className="space-y-3">
                <SocialAuthButton
                  provider="google"
                  onClick={() => console.log("Sign in with Google")}
                />
                <SocialAuthButton
                  provider="facebook"
                  onClick={() => console.log("Sign in with Facebook")}
                />
              </div>
              <p className="flex gap-1 justify-center text-center open-sans text-[15.6px] pt-4">
                Don't you have an account?{" "}
                <Link href="/sign-up" className="text-blue-600">
                  Sign up
                </Link>
              </p>
            </form>
          </FormProvider>
        </div>
      </section>
    </div>
  );
}