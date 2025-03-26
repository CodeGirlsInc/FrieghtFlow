"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

const CustomSelect = ({
  label,
  options,
  placeholder,
  optional = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const handleSelect = (value, label) => {
    setSelectedOption(label);
    setIsOpen(false);
    // Here you would update the form data
  };

  return (
    <div className="mb-4">
      <label className="block text-[#0C1421] text-[14.72px] font-['Open_Sans'] font-normal mb-2 leading-[100%] tracking-[1%] align-middle">
        {label}{" "}
        {optional && (
          <span className="text-[#0C1421] text-sm italic text-[14.72px]  font-['Open_Sans'] font-normal leading-[100%] tracking-[1%] align-middle">
            (Optional)
          </span>
        )}
      </label>
      <div className="relative">
        {/* Custom select header */}
        <div
          className="w-[100%]  h-[51.2px]  px-4 py-2 flex items-center justify-between bg-[#F4F6F3] border border-gray-200  rounded-[4px] cursor-pointer"
          style={{ borderRadius: "4px" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`${
              selectedOption
                ? "text-[14.4px] text-[#8897AD] leading-[100%] tracking-[1%] align-middle font-['Open_Sans'] font-normal "
                : "text-[14.4px] text-[#8897AD] leading-[100%] tracking-[1%] align-middle font-['Open_Sans'] font-normal "
            }`}
          >
            {selectedOption || placeholder}
          </span>
          <span className="text-[#1B1E1F80] ">▼</span>
        </div>

        {/* Dropdown options */}
        {isOpen && (
          <div className="absolute z-10 w-[100%]   mt-1 bg-white border border-gray-200 rounded shadow-lg">
            {options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center px-4 py-2 hover:bg-[#E9D7B4] cursor-pointer"
                onClick={() => handleSelect(option.value, option.label)}
              >
                <div className="w-5 h-5 mr-2 border border-[#D4D7E3] bg-[#FFFFFF]  hover:border-[#D4D7E3] hover:bg-[#FFFFFF] flex items-center justify-center">
                  {selectedOption === option.label && (
                    <div className="w-3 h-3 bg-[#ffffff]"></div>
                  )}
                </div>
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Hidden native select for form submission */}
        <select className="sr-only" value={selectedOption} {...props}>
          <option value="" disabled>
            {placeholder}
          </option>
          {options?.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const Input = ({ label, optional = false, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-[#0C1421]  text-[14.72px] font-['Open_Sans'] font-normal mb-2 leading-[100%] tracking-[1%] align-middle">
        {label}{" "}
        {optional && (
          <span className="text-[#0C1421]  text-[14.72px italic font-['Open_Sans'] font-normal leading-[100%] tracking-[1%] align-middle">
            (Optional)
          </span>
        )}
      </label>
      <input
        className="w-[100%]  h-[51.2px] text-[14.4px] text-[#8897AD] leading-[100%] tracking-[1%] align-middle font-['Open_Sans'] font-normal  px-4 py-2 bg-[#F4F6F3] border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
};

const Button = ({ children, ...props }) => {
  return (
    <button
      className="w-full py-4 px-6 bg-[#B57704] text-white text-center rounded-[20px] font-medium text-xl hover:bg-[#956811] transition-colors"
      {...props}
    >
      {children}
    </button>
  );
};

const SmallBusiness = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Here you would typically send the data to your backend
  };

  const employeeOptions = [
    { value: "1-5", label: "1-5" },
    { value: "6-10", label: "6-10" },
    { value: "11-50", label: "11-50" },
    { value: "51-200", label: "51-200" },
    { value: "201+", label: "201+" },
  ];

  const businessTypeOptions = [
    { value: "retail", label: "Retail" },
    { value: "wholesale", label: "Wholesale" },
    { value: "manufacturer", label: "Manufacturer" },
    { value: "ecommerce", label: "E-Commerce" },
    { value: "other", label: "Other" },
  ];

  const countryOptions = [
    { value: "af", label: "Afghanistan" },
    { value: "al", label: "Albania" },
    { value: "dz", label: "Algeria" },
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "mx", label: "Mexico" },
    { value: "uk", label: "United Kingdom" },
    // Add more countries as needed
  ];

  const stateOptions = [
    { value: "al", label: "Alabama" },
    { value: "ak", label: "Alaska" },
    { value: "az", label: "Arizona" },
    { value: "ca", label: "California" },
    // Add more states as needed
  ];

  const shippingFrequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
  ];

  const packageSizeOptions = [
    { value: "small", label: "Small (0-5 lbs)" },
    { value: "medium", label: "Medium (6-20 lbs)" },
    { value: "large", label: "Large (21-50 lbs)" },
    { value: "xlarge", label: "X-Large (51+ lbs)" },
  ];

  const shippingPartnersOptions = [
    { value: "fedex", label: "FedEx" },
    { value: "ups", label: "UPS" },
    { value: "usps", label: "USPS" },
    { value: "dhl", label: "DHL" },
  ];
    const LocationOptions = [
      { value: "new_york", label: "New York, USA" },
      { value: "lagos", label: "Lagos, Nigeria" },
      { value: "berlin", label: "Berlin, Germany" },
      { value: "tokyo", label: "Tokyo, Japan" },
      { value: "los_angeles", label: "Los Angeles, USA" },
     
    ];


  return (
    <div className="min-h-screen w-full relative">
    {/* Split background - top half gradient, bottom half white */}
    <div className="absolute inset-0">
      <div
        className="h-1/2"
        style={{
          background:
            "linear-gradient(72.28deg, #1B1E1F 16.3%, #1B1E1F 25.66%, #1B1E1F 32.86%, #1B1E1F 42.93%, #1B1E1F 54.51%, #5E4717 77.38%, #795714 90.51%, #956811 104.43%, #E19508 113.96%)",
        }}
      ></div>
      <div className="h-1/2 bg-white"></div>
    </div>

    {/* Content container */}
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="text-center pt-10 pb-16">
        <h1 className="text-4xl text-white font-bold mb-2">Small Business</h1>
        <p className="text-white opacity-80">
          Suitable for Start-up, retailers and small scale distributors
        </p>
      </div>

      {/* Form section */}
      <div
        className="bg-white py-5 my-5 shadow-lg rounded-[20px] p-0  sm:p-8 mx-auto "
        style={{ width: 'full', maxWidth: "1095px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4  mx-auto">
            {/* Left Column */}
            <div >
             <div className=" m-2 md:ml-[5%]">
             <Input
                label="Business Name"
                placeholder="Enter business name"
                {...register("businessName")}
              />

              <CustomSelect
                label="Business Type"
                placeholder="E.g retail, wholesale, manufacturer"
                options={businessTypeOptions}
                {...register("businessType")}
              />

              <Input
                label="Business Registration Number"
                optional={true}
                placeholder="Enter registration number"
                {...register("registrationNumber")}
              />

              <CustomSelect
                label="Number of Employees"
                placeholder="1-5"
                options={employeeOptions}
                {...register("employeeCount")}
              />

              <CustomSelect
                label="Country Selection"
                placeholder="Select country"
                options={countryOptions}
                {...register("country")}
              />

              <CustomSelect
                label="State Selection"
                placeholder="Select state"
                options={stateOptions}
                {...register("state")}
              />
             </div>
            </div>

            {/* Right Column */}
            <div >
             <div className="m-2  md:mr-[2%]" >
             <CustomSelect
                label="Preferred Shipping Partners"
                placeholder="Select Shipping Partners"
                options={shippingPartnersOptions}
                {...register("shippingPartners")}
              />

              <CustomSelect
                label="Pickup and Delivery Location"
                placeholder="Select pickup and delivery location"
                options={LocationOptions}
                {...register("pickupLocation")}
              />

              <CustomSelect
                label="Shipping Frequency"
                placeholder="Select shipping frequency"
                options={shippingFrequencyOptions}
                {...register("shippingFrequency")}
              />

              <CustomSelect
                label="Average Package Weight and Size"
                placeholder="Select package weight and size"
                options={packageSizeOptions}
                {...register("packageSize")}
              />

              <Input
                label="Contact Person Details"
                placeholder="Enter Full name"
                {...register("contactName")}
              />

              <Input
                label="Contact Person Details"
                placeholder="Enter phone number and email address"
                {...register("contactInfo")}
              />
             </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-md">
              <Button type="submit">REGISTER</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};

export default SmallBusiness;