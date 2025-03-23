import React from "react";
import GoogleIcon from "@/svg/GoogleIcon";
import FaceBookIcon from "@/svg/FaceBookIcon";

const providerIcons = {
  google: GoogleIcon,
  facebook: FaceBookIcon,
};

const providerText = {
  google: "Sign in with Google",
  facebook: "Sign in with Facebook",
};

const SocialAuthButton = ({ provider, onClick }) => {
  const IconComponent = providerIcons[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-[57px] flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-[4.5px] border border-gray-200 transition duration-200"
    >
      <div className="w-6 h-6">
        <IconComponent className="w-full h-full" />{" "}
        {/* Directly render the SVG component */}
      </div>
      <span className="font-medium">{providerText[provider]}</span>
    </button>
  );
};

export default SocialAuthButton;
