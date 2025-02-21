import Image from "next/image";
import banner from "@/public/assets/banner.png";
import logistics from "@/public/assets/logistics.png";
import SignUpInput from "./components/sign-up-input";

export const metadata = {
  title: "Sign Up",
  description: "Sign Up to FreightFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUp() {
  return (
    <div className="w-full flex text-black min-h-screen justify-center items-center  bg-white relative">
      {/* Background Banner Image */}
      <Image
        src={banner}
        alt="banner"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
      />

      {/* Main Container */}
      <div className="flex flex-col md:flex-row justify-center mx-3  items-center w-full max-w-4xl py-8 md:py-0 bg-white shadow-lg rounded-lg z-10 ">
        
        {/* Sign-up Form */}
        <div className="flex flex-col gap-y-6 w-full md:w-1/2 px-6 md:px-12">
          <h1 className="text-2xl font-semibold text-[#1D212A] font-poppins text-center md:text-left">
            Sign Up
          </h1>
          <SignUpInput />
        </div>

        {/* Logistics Image (Hidden on Small Screens) */}
        <div className="hidden md:flex justify-center items-center w-full md:w-3/4">
          <Image src={logistics} alt="logistics" className="w-full h-auto object-contain" />
        </div>
      </div>
    </div>
  );
}

// import Image from "next/image";
// import banner from "@/public/assets/banner.png";
// import logistics from "@/public/assets/logistics.png";
// import SignUpInput from "./components/sign-up-input";
// export const metadata = {
//   title: "Sign Up",
//   description: "Sign Up to FreightFlow",
//   robots: {
//     index: false,
//     follow: false,
//   },
// };

// export default function SignUp() {
//     return (
//       <div className="w-full flex text-black min-h-screen justify-center relative items-center bg-white">
//         <Image src={banner}  alt="banner" className="absolute top-0 z-auto left-0 "/>
//         <div className="flex flex-col justify-center bg-white items-center z-[9999px]">
//           <div className="border border-grey w-full h-3/4 shadow-lg z-[9999px]  rounded-[8px] flex justify-center">
//             <div className="flex flex-row justify-between">
//               <div className="flex flex-col  mt-5 px-16 gap-y-6">
//               <h1 className="text-[24px] text-[#1D212A] leading-[28.8px] font-normal font-poppins pt-10 pl-3">Sign Up</h1>
//               <SignUpInput/>
//               </div>
           
//               <div>
//                 <Image src={logistics} className="" alt=""/>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }