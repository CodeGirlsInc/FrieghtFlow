import * as yup from "yup";

export const IndependentShipperSchema = yup.object({
  fullName: yup
    .string()
    .required("Full Name is required")
    .min(2, "Full Name must be at least 2 characters"),
  availabilitySchedule: yup
    .string()
    .required("Please select an availability schedule"),
  vehicleType: yup.string().required("Please select a shipping method"),
  maxLoadCapacity: yup.string().required("Please enter maximum load capacity"),
  licenseFile: yup
    .mixed()
    .required("Please upload license/certitication document"),
  experienceYears: yup.string().required("Please select your experience level"),
  routeCoverage: yup
    .string()
    .required("Please select your preferred route coverage"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .min(10, "Please enter a valid phone number"),
  insuranceDetails: yup.string().optional(),
  emailAddress: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
});
