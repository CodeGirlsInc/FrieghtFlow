"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "../ui/Button";
import { IndependentShipperSchema } from "@/lib/validation-schemas/indepent-shipper-schema";
import SelectV2 from "../ui/SelectV2";
import FileUpload from "../ui/FileUpload";

// Dummy Data
const vehicleOptions = [
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
  { value: "semi", label: "Semi-Trailer" },
  { value: "refrigerated", label: "Refrigerated" },
  { value: "flatbed", label: "Flatbed" },
];

const routeCoverageOptions = [
  { value: "local", label: "Local (within city)" },
  { value: "regional", label: "Regional (within state)" },
  { value: "national", label: "National" },
  { value: "international", label: "International" },
];

const availabilityOptions = [
  { value: "weekdays", label: "Weekdays Only" },
  { value: "weekends", label: "Weekends Only" },
  { value: "all-week", label: "All Week" },
  { value: "custom", label: "Custom Schedule" },
];

const loadCapacityOptions = [
  { value: "1ton", label: "Up to 1 ton" },
  { value: "5ton", label: "1-5 tons" },
  { value: "10ton", label: "5-10 tons" },
  { value: "20ton", label: "10-20 tons" },
  { value: "20plus", label: "20+ tons" },
];

const experienceOptions = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10plus", label: "10+ years" },
];
const Input = ({ label, optional = false, error, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-[#0C1421]  text-[14.72px] font-open-sans font-normal mb-1 leading-[100%] tracking-[1%] align-middle">
        {label}{" "}
        {optional && (
          <span className="text-[#0C1421] text-[14.72px] font-open-sans font-normal leading-[100%] tracking-[1%] align-middle">
            (Optional but recommended)
          </span>
        )}
      </label>
      <input
        className="w-[100%]  h-[51.2px] text-[14.4px] text-[#8897AD] leading-[100%] tracking-[1%] align-middle font-open-sans font-normal  px-4 py-2 bg-[#F4F6F3] border border-gray-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

const IndependentShipper = () => {
  const { register, handleSubmit } = useForm();
  const [errors, setErrors] = useState({});

  const form = useForm({
    resolver: yupResolver(IndependentShipperSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      insuranceDetails: "",
      emailAddress: "",
    },
  });

  const onSubmit = (values) => {
    console.log(values);
  };

  const handleFormSubmit = form.handleSubmit(onSubmit, (errors) => {
    const errorMessages = {};
    Object.entries(errors).forEach(([key, value]) => {
      if (value?.message) {
        errorMessages[key] = value.message;
      }
    });
    setErrors(errorMessages);
  });

  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0">
        <div
          className="h-1/2"
          style={{
            background:
              "linear-gradient(72.28deg, #1B1E1F 16.3%, #1B1E1F 25.66%, #1B1E1F 32.86%, #1B1E1F 42.93%, #1B1E1F 54.51%, #5E4717 77.38%, #795714 90.51%, #956811 104.43%, #E19508 113.96%)",
          }}
        ></div>
        <div className="bg-white h-1/2"></div>
      </div>

      {/* Content container */}
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="pt-10 pb-16 text-center font-open-sans">
          <h1 className="mb-2 text-4xl font-bold text-white">
            Independent Shipper
          </h1>
          <p className="text-xl font-light text-white opacity-80">
            Suitable for freelance logistics providers, individual transporters,
            and owner operators
          </p>
        </div>

        {/* Form section */}
        <div
          className="bg-white py-5 my-5 shadow-lg rounded-[20px] p-0  sm:p-8 mx-auto "
          style={{ width: "full", maxWidth: "1095px" }}
        >
          <form onSubmit={handleFormSubmit} className="w-full">
            <div className="grid grid-cols-1 mx-auto md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left Column */}
              <div>
                <div className=" m-2 md:ml-[5%]">
                  <Input
                    label="Full Name"
                    placeholder="Enter full name"
                    {...form.register("fullName")}
                    error={errors.fullName}
                  />

                  <SelectV2
                    label="Type of Vehicle/Shipping Method"
                    options={vehicleOptions}
                    placeholder="Select Shipping Method"
                    value={form.watch("vehicleType") || ""}
                    onChange={(value) =>
                      form.setValue("vehicleType", value, {
                        shouldValidate: true,
                      })
                    }
                    error={errors.vehicleType}
                  />

                  <FileUpload
                    label="License & Certification Upload"
                    onChange={(file) => form.setValue("licenseFile", file)}
                    error={errors.licenseFile}
                  />

                  <SelectV2
                    label="Preferred Route Coverage"
                    options={routeCoverageOptions}
                    placeholder="Select route coverage"
                    value={form.watch("routeCoverage") || ""}
                    onChange={(value) =>
                      form.setValue("routeCoverage", value, {
                        shouldValidate: true,
                      })
                    }
                    error={errors.routeCoverage}
                  />

                  <Input
                    label="Insurance Details"
                    placeholder="Enter insurance details"
                    optional={true}
                    {...form.register("insuranceDetails")}
                    error={errors.insuranceDetails}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className=" m-2 md:mr-[5%]">
                  <SelectV2
                    label="Availability Schedule"
                    options={availabilityOptions}
                    placeholder="Select availability schedule"
                    value={form.watch("availabilitySchedule") || ""}
                    onChange={(value) =>
                      form.setValue("availabilitySchedule", value, {
                        shouldValidate: true,
                      })
                    }
                    error={errors.availabilitySchedule}
                  />

                  <SelectV2
                    label="Maximum Load Capacity (KG or Ton)"
                    options={loadCapacityOptions}
                    placeholder="Enter maximum load capacity"
                    value={form.watch("maxLoadCapacity") || ""}
                    onChange={(value) =>
                      form.setValue("maxLoadCapacity", value, {
                        shouldValidate: true,
                      })
                    }
                    error={errors.maxLoadCapacity}
                  />

                  <SelectV2
                    label="Experience in Logistics (Years)"
                    options={experienceOptions}
                    placeholder="Enter experience"
                    value={form.watch("experienceYears") || ""}
                    onChange={(value) =>
                      form.setValue("experienceYears", value, {
                        shouldValidate: true,
                      })
                    }
                    error={errors.experienceYears}
                  />

                  <Input
                    label="Contact Phone Number"
                    placeholder="Enter contact phone number"
                    {...form.register("phoneNumber")}
                    error={errors.phoneNumber}
                  />

                  <Input
                    label="Contact Email Address"
                    placeholder="Enter email address"
                    {...form.register("emailAddress")}
                    error={errors.emailAddress}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <div className="w-full max-w-md">
                <Button text={"REGISTER"} />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IndependentShipper;
