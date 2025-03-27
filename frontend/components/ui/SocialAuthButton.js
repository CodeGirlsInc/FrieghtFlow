import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/router";
import Image from "next/image";
const providerIcons = {
  google: "/google-icon.svg",
  facebook: "/facebook-icon.svg", // Update with the correct filename
};

const providerText = {
  google: "Sign in with Google",
  facebook: "Sign in with Facebook",
};

const SocialAuthButton = ({ provider, onClick }) => {
  const signup = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
    
      if (credentialResponse.access_token) {
        try { 
          console.log ("Access token", credentialResponse.access_token)
          
          
          // router.push(redirectPath); // Use router.push instead of window.location.href
        } catch (error) {
          toast.error('Unable to sign up with Google, kindly use other method');
        }
      }
    },
    onError: () => {
      console.log('Login Failed');
    },
  });

  return (
    <button
      type="button"
      onClick={()=>signup()}
      className="w-full h-[57px] flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-[4.5px] border border-gray-200 transition duration-200"
    >
      <Image
        src={providerIcons[provider]}
        alt={`${provider} icon`}
        width={24}
        height={24}
        // className="w-6 h-6"
      />
      <span className="font-medium">{providerText[provider]}</span>
    </button>
  );
};

export default SocialAuthButton;
