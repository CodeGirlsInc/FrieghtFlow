import React from "react";

const providerIcons = {
  google: "/google-icon.svg", // Update with the correct filename
  facebook: "/facebook-icon.svg", // Update with the correct filename
};

const providerText = {
  google: "Sign in with Google",
  facebook: "Sign in with Facebook",
};

const SocialAuthButton = ({ provider, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-[57px] flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-[4.5px] border border-gray-200 transition duration-200"
    >
      <img
        src={providerIcons[provider]}
        alt={`${provider} icon`}
        className="w-6 h-6"
      />
      <span className="font-medium">{providerText[provider]}</span>
    </button>
  );
};

export default SocialAuthButton;
