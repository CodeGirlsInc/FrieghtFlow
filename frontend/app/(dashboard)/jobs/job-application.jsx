"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Calendar, Truck } from "lucide-react";

export default function JobApplication({ job, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "Alex Thompson", // Pre-filled for demo
    email: "alex@example.com", // Pre-filled for demo
    phone: "(555) 123-4567", // Pre-filled for demo
    availableDate: new Date(job.startDate).toISOString().split("T")[0],
    rate: job.compensation.amount,
    equipmentType: job.equipment.type,
    equipmentYear: "2020",
    hasRequiredCertifications: true,
    hasRequiredInsurance: true,
    additionalNotes: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.availableDate) {
      newErrors.availableDate = "Available date is required";
    }

    if (!formData.equipmentType) {
      newErrors.equipmentType = "Equipment type is required";
    }

    if (!formData.equipmentYear) {
      newErrors.equipmentYear = "Equipment year is required";
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="text-lg font-medium">{job.title}</div>
        <div className="text-subText">{job.company.name}</div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">Personal Information</h3>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Job Details</h3>

          <div className="space-y-2">
            <Label htmlFor="availableDate">Available Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
              <Input
                id="availableDate"
                type="date"
                className={`pl-9 ${
                  errors.availableDate ? "border-red-500" : ""
                }`}
                value={formData.availableDate}
                onChange={(e) => handleChange("availableDate", e.target.value)}
              />
            </div>
            {errors.availableDate && (
              <p className="text-sm text-red-500">{errors.availableDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Your Rate (USD)</Label>
            <Input
              id="rate"
              type="number"
              value={formData.rate}
              onChange={(e) =>
                handleChange("rate", Number.parseFloat(e.target.value))
              }
            />
            <p className="text-xs text-subText">
              Suggested rate: ${job.compensation.amount}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">Equipment Information</h3>

          <div className="space-y-2">
            <Label htmlFor="equipmentType">Equipment Type</Label>
            <Select
              value={formData.equipmentType}
              onValueChange={(value) => handleChange("equipmentType", value)}
            >
              <SelectTrigger
                id="equipmentType"
                className={errors.equipmentType ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="van">Dry Van</SelectItem>
                <SelectItem value="refrigerated">Refrigerated</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
                <SelectItem value="tanker">Tanker</SelectItem>
                <SelectItem value="box truck">Box Truck</SelectItem>
                <SelectItem value="moving truck">Moving Truck</SelectItem>
                <SelectItem value="day cab">Day Cab</SelectItem>
              </SelectContent>
            </Select>
            {errors.equipmentType && (
              <p className="text-sm text-red-500">{errors.equipmentType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipmentYear">Equipment Year</Label>
            <Input
              id="equipmentYear"
              value={formData.equipmentYear}
              onChange={(e) => handleChange("equipmentYear", e.target.value)}
              className={errors.equipmentYear ? "border-red-500" : ""}
            />
            {errors.equipmentYear && (
              <p className="text-sm text-red-500">{errors.equipmentYear}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Requirements</h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="hasRequiredCertifications"
                checked={formData.hasRequiredCertifications}
                onCheckedChange={(checked) =>
                  handleChange("hasRequiredCertifications", checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="hasRequiredCertifications"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have all required certifications for this job
                </Label>
                <p className="text-sm text-subText">
                  {job.requirements.certifications &&
                  job.requirements.certifications.length > 0
                    ? job.requirements.certifications.join(", ")
                    : "No specific certifications required"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="hasRequiredInsurance"
                checked={formData.hasRequiredInsurance}
                onCheckedChange={(checked) =>
                  handleChange("hasRequiredInsurance", checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="hasRequiredInsurance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have all required insurance for this job
                </Label>
                <p className="text-sm text-subText">
                  {job.requirements.insurance.join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
        <textarea
          id="additionalNotes"
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Any additional information you'd like to share..."
          value={formData.additionalNotes}
          onChange={(e) => handleChange("additionalNotes", e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="termsAccepted"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) =>
              handleChange("termsAccepted", checked)
            }
            className={errors.termsAccepted ? "border-red-500" : ""}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="termsAccepted"
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                errors.termsAccepted ? "text-red-500" : ""
              }`}
            >
              I agree to the terms and conditions
            </Label>
            <p className="text-sm text-subText">
              By applying, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-red-500">{errors.termsAccepted}</p>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Important Note</h4>
            <p className="text-sm text-yellow-700 mt-1">
              By submitting this application, you're confirming that you meet
              all the requirements for this job and that all information
              provided is accurate.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Truck className="mr-2 h-4 w-4" />
          Submit Application
        </Button>
      </div>
    </form>
  );
}
