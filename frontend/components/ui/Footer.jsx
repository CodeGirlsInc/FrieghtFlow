"use client";
import React, { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log("Subscribing:", email);
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="col-span-full flex justify-center items-center mb-6 flex-col">
        <img
          src="/Logo2.png"
          alt="FreightFlow Logo"
          className="h-10 w-10 mr-2"
        />
        <span className="text-xl font-bold">FreightFlow</span>
      </div>
      <div className="mx-4 md:mx-10 lg:mx-20 border-t">
        <div className="flex flex-col md:flex-row justify-between w-full mt-7 space-y-6 md:space-y-0">
          <div className="w-full md:w-auto">
            <h4 className="font-semibold mb-4">Reach us</h4>
            <div className="space-y-2">
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.036 11.036 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                +1012 3456 789
              </p>
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                demo@gmail.com
              </p>
              <p className="flex items-center w-full md:w-80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                132 Dartmouth Street Boston, Massachusetts 02156 United States
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="hover:text-gray-300">
                  About
                </a>
              </li>
              <li className="mt-3">
                <a href="#contact" className="hover:text-gray-300">
                  Contact
                </a>
              </li>
              <li className="mt-3">
                <a href="#blogs" className="hover:text-gray-300">
                  Blogs
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full md:w-auto">
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#privacy" className="hover:text-gray-300">
                  Privacy Policy
                </a>
              </li>
              <li className="mt-4">
                <a href="#terms" className="hover:text-gray-300">
                  Terms & Services
                </a>
              </li>
              <li className="mt-4">
                <a href="#use" className="hover:text-gray-300">
                  Terms of Use
                </a>
              </li>
              <li className="mt-4">
                <a href="#refund" className="hover:text-gray-300">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-auto">
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <a href="#air" className="hover:text-gray-300">
                  Air Transport
                </a>
              </li>
              <li className="mt-3">
                <a href="#ship" className="hover:text-gray-300">
                  Ship Transport
                </a>
              </li>
              <li className="mt-3">
                <a href="#road" className="hover:text-gray-300">
                  Road Transport
                </a>
              </li>
            </ul>
          </div>

          <div className=" ">
            <div className="max-w-md mx-auto bg-[#011621] rounded h-48 p-4 flex flex-col justify-between">
              <h4 className="font-semibold mb-4 text-center">
                Join Our Newsletter
              </h4>
              <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-4 py-2 text-gray-900 bg-[#02273A] rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-amber-600 text-white px-2 md:px-4 mt-4 md:mt-0 py-2 rounded-md md:rounded-r-md hover:bg-amber-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-center mt-2 text-gray-400">
                * Will send you weekly updates for your better tool management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
