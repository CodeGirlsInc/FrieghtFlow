import React from "react";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const TrackShipments = () => {
  return (
    <div className={`w-full flex items-center flex-col justify-center text-center ${openSans.className}`}>
      <div className="w-full mb-[2rem] md:mb-[3rem]">
        <h2 className="text-[#956811] font-semibold text-[32px] md:text-4xl leading-[60px] md:leading-[80px]">
          Track Shipment
        </h2>
        <p className="text-[#0C1421] font-light text-base md:text-[24px] leading-tight md:leading-[40px]">
          Stay updated on deliveries using Real - Time Tracking
        </p>
      </div>

      <div className=" w-[100%] p-[1rem] md:p-[3rem] rounded-[40px] md:rounded-[80px] bg-[url('/shipment.webp')] bg-cover bg-center">
        <div className="md:w-[506px] rounded-[20px]  md:rounded-[40px] bg-white p-[1.5rem] md:float-end ">
          <h3 className="font-semibold text-[1rem] md:text-[36px] md:leading-[60px] text-center text-[#3D4549] mb-[3rem]">
            GPS TRACKING ON <br /> SHIPMENTS
          </h3>
          <ul className="flex flex-col space-y-[.7rem] md:space-y-[1rem]">
            <li className="bg-[#B5770426] rounded-[12px] p-4 md:p-0 md:h-[88px] w-full font-normal text-base md:text-[20px] leading-[100%] hover:scale-[98%]duration-500">
              <input
                type="text"
                placeholder="Enter your shipment code"
                className="w-full h-full text-center border-none outline-none focus:border-none focus:outline-none bg-transparent text-[#43433C] placeholder:text-[#43433C]"
              />
            </li>
            <li className="bg-[#B5770426] rounded-[12px] p-4 md:h-[88px] w-full font-normal text-base md:text-[20px] leading-[100%] flex items-center justify-center text-[#43433C] hover:scale-[98%] duration-500">
              Select your service
            </li>
            <li className="bg-[#B57704] p-4 md:h-[88px] rounded-[12px] w-full font-normal text-base md:text-[24px] leading-[100%] text-white hover:scale-[98%] duration-500">
              <button className="w-full h-full items-center bg-transparent border-none">
                Track now
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrackShipments;
