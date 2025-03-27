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

import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import backgroundImage from "@/public/backgroundimage.svg";
import SocialAuthButton from "@/components/ui/SocialAuthButton";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();

  useEffect(() => {
    // Si está autenticado, redirigir al home
    if (isAuthenticated) {
      router.push('/');
    }
    // Si hay un error de autenticación, mantener en la página de sign-in
    if (error) {
      console.error('Authentication error:', error);
    }
  }, [isAuthenticated, error, router]);

  const handleLogin = async (provider = null) => {
    try {
      const options = {
        authorizationParams: {
          redirect_uri: window.location.origin + '/callback',
        },
        appState: {
          returnTo: window.location.origin,
        }
      };

      if (provider) {
        options.authorizationParams = {
          ...options.authorizationParams,
          connection: provider,
          prompt: 'select_account',
          screen_hint: 'signup',
          scope: 'openid profile email',
        };
      }

      await loginWithRedirect(options);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

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

        {/* Tablet view of the image */}
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

        {/* Desktop view of image */}
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

      {/* Right section with auth buttons */}
      <section className="w-[470px] xl:w-[634.2px] flex flex-col items-center py-16 px-8 lg:px-14 xl:px-20">
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

          <div className="space-y-4">
            <Button
              onClick={() => handleLogin()}
              text="Sign in with Email"
              className="w-full h-[57px] open_sans rounded-[4.5px] text-[15.6px] bg-amber-600 hover:bg-amber-700"
            />

            {/* Social authentication buttons */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <SocialAuthButton
                provider="google"
                onClick={() => handleLogin('google-oauth2')}
              />
              <SocialAuthButton
                provider="facebook"
                onClick={() => handleLogin('facebook')}
              />
            </div>

            <p className="flex gap-1 justify-center text-center open-sans text-[15.6px] pt-4">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-blue-600">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
