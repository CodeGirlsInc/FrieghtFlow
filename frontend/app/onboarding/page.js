"use client";
import { useState } from "react";
import OnboardingCard from "@/components/onboarding/OnboardingCard";
import { motion } from "framer-motion";

const roles = [
  {
    id: "small-business",
    title: "Small Business",
    icon: "/icons/small-business.svg",
  },
  {
    id: "large-enterprise",
    title: "Large Enterprise",
    icon: "/icons/large-enterprise.svg",
  },
  {
    id: "independent-shipper",
    title: "Independent Shipper",
    icon: "/icons/independent-shipper.svg",
  },
];

export default function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  return (
    <div className="lg:h-screen bg-[linear-gradient(180deg,rgba(0,0,0,0.85),rgba(0,0,0,0.85)),url('/backgroundimage.svg')] lg:bg-cover bg-center flex flex-col items-center justify-center py-20 px-4 lg:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Select your role</h1>
        <p className="text-gray-300 text-lg max-w-2xl">
          Before we hit the road, let's tailor your preferences for a seamless
          freight experience.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 max-w-6xl mx-auto">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: roles.indexOf(role) * 0.1 }}
          >
            <OnboardingCard
              role={role.title}
              icon={role.icon}
              isSelected={selectedRole === role.id}
              onClick={() => handleRoleSelect(role.id)}
            />
          </motion.div>
        ))}
      </div>

      <button
        className={`
          mt-14 px-[80px] py-[20px] rounded-lg
          bg-[#B57704] text-white transform transition-all duration-300
          hover:bg-[#B57704]
        `}
      >
        GET STARTED
      </button>
    </div>
  );
}
