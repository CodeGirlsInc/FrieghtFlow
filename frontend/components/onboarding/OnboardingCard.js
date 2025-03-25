"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const OnboardingCard = ({ role, icon, isSelected, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        p-8 rounded-lg bg-white cursor-pointer
        transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center gap-4
        min-w-[280px] min-h-[280px]
        ${
          isSelected
            ? "border-[6px] border-[#B57704]"
            : "border border-gray-200"
        }
        hover:shadow-lg
      `}
    >
      <div className="w-16 h-16 relative">
        <Image
          src={icon}
          alt={role}
          fill
          className={`object-contain ${
            isSelected ? "text-[#B88746]" : "text-gray-600"
          }`}
        />
      </div>
      <h3 className="text-xl text-gray-800">{role}</h3>
    </motion.div>
  );
};

export default OnboardingCard;
