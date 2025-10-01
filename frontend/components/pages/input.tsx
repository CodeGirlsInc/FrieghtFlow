"use client";

import { Input } from "@/components/ui/Input";
import { User, Eye, EyeOff, Mail, Lock, Search } from "lucide-react";
import { useState } from "react";

export default function InputPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    search: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Form submitted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        /** * Utility function to merge Tailwind CSS classes with proper
        precedence. * Combines clsx for conditional classes and tailwind-merge
        for deduplication. * * @param inputs - Class values to merge * @returns
        Merged class string */
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Input Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive showcase of the reusable Input component
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Login Form Example
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  leftIcon={<User className="h-4 w-4" />}
                  value={formData.username}
                  onChange={handleInputChange("username")}
                  error={errors.username}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  error={errors.email}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  error={errors.password}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Sign In
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Component Variations
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Basic Input
                </h3>
                <Input placeholder="Basic input without icons" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Search Input
                </h3>
                <Input
                  placeholder="Search..."
                  leftIcon={<Search className="h-4 w-4" />}
                  value={formData.search}
                  onChange={handleInputChange("search")}
                />
              </div>
              /** * Utility function to merge Tailwind CSS classes with proper
              precedence. * Combines clsx for conditional classes and
              tailwind-merge for deduplication. * * @param inputs - Class values
              to merge * @returns Merged class string */
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Disabled Input
                </h3>
                <Input
                  placeholder="This input is disabled"
                  leftIcon={<User className="h-4 w-4" />}
                  disabled
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Input with Error
                </h3>
                <Input
                  placeholder="Input with error state"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error="This field has an error"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Number Input
                </h3>
                <Input
                  type="number"
                  placeholder="Enter a number"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Custom Styling
                </h3>
                <Input
                  placeholder="Custom styled input"
                  leftIcon={<User className="h-4 w-4" />}
                  className="border-green-500 focus:ring-green-500"
                  inputClassName="text-green-700"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Input Component Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">
                  TypeScript Support
                </h3>
                <p className="text-sm text-gray-600">
                  Fully typed with proper interfaces
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Icon Slots</h3>
                <p className="text-sm text-gray-600">
                  Left and right icon support
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Error States</h3>
                <p className="text-sm text-gray-600">
                  Built-in error handling and display
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">React Hook Form</h3>
                <p className="text-sm text-gray-600">
                  Compatible with form libraries
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Accessibility</h3>
                <p className="text-sm text-gray-600">
                  ARIA attributes and keyboard support
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900">Customizable</h3>
                <p className="text-sm text-gray-600">
                  Custom styling and class overrides
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
