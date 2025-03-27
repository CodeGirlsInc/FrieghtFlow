"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import Image from "next/image";

const Header = () => {
  const navigation = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth0();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout({ returnTo: window.location.origin });
    } else {
      navigation.push("/sign-up");
    }
  };

  return (
    <header className="flex items-center justify-between py-2 px-10 bg-white shadow-md">
      {/* Logo */}
      <div className="flex items-center flex-col">
        <div className="h-12 w-14">
          <img
            src="/logo.png"
            alt="FreightFlow Logo"
            className="object-cover w-full h-full"
          />
        </div>
        <span className="text-xs hidden md:flex font-bold text-gray-800">FreightFlow</span>
      </div>

      <div className="flex flex-row items-center w-1/2 justify-between ml-7">
        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex space-x-6 w-[70%] justify-between">
          <a
            href="#home"
            className="text-gray-600 hover:text-amber-600 transition-colors"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            About
          </a>
          <a
            href="#services"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Services
          </a>
          <a
            href="#contact"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Auth Button and User Info */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && user && (
            <div className="flex items-center space-x-2">
              {user.picture && (
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  <Image
                    src={user.picture}
                    alt={user.name || "User profile"}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-sm text-gray-700">{user.name}</span>
            </div>
          )}
          <button
            onClick={handleAuthAction}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            {isAuthenticated ? "Logout" : "Sign Up"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg md:hidden">
          <nav className="flex flex-col p-4 space-y-4">
            <a href="#home" className="text-gray-600 hover:text-gray-900">
              Home
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">
              About
            </a>
            <a href="#services" className="text-gray-600 hover:text-gray-900">
              Services
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </a>
            {isAuthenticated && user && (
              <div className="flex items-center space-x-2 py-2">
                {user.picture && (
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <Image
                      src={user.picture}
                      alt={user.name || "User profile"}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
            )}
            <button
              onClick={handleAuthAction}
              className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors w-full"
            >
              {isAuthenticated ? "Logout" : "Sign Up"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
