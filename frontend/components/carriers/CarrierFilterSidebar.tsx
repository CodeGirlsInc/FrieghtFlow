"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  CarrierFilters,
  VehicleType,
  CargoSpecialization,
  DeliverySpeed,
  vehicleTypeLabels,
  cargoSpecializationLabels,
  deliverySpeedLabels,
  defaultFilters,
} from "@/types/carrier";

interface CarrierFilterSidebarProps {
  filters: CarrierFilters;
  onFiltersChange: (filters: CarrierFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CarrierFilterSidebar: React.FC<CarrierFilterSidebarProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
}) => {
  const handleVehicleTypeChange = (type: VehicleType) => {
    const newTypes = filters.vehicleTypes.includes(type)
      ? filters.vehicleTypes.filter((t) => t !== type)
      : [...filters.vehicleTypes, type];
    onFiltersChange({ ...filters, vehicleTypes: newTypes });
  };

  const handleCargoSpecChange = (spec: CargoSpecialization) => {
    const newSpecs = filters.cargoSpecializations.includes(spec)
      ? filters.cargoSpecializations.filter((s) => s !== spec)
      : [...filters.cargoSpecializations, spec];
    onFiltersChange({ ...filters, cargoSpecializations: newSpecs });
  };

  const handleDeliverySpeedChange = (speed: DeliverySpeed) => {
    const newSpeeds = filters.deliverySpeed.includes(speed)
      ? filters.deliverySpeed.filter((s) => s !== speed)
      : [...filters.deliverySpeed, speed];
    onFiltersChange({ ...filters, deliverySpeed: newSpeeds });
  };

  const handleClearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const vehicleTypes: VehicleType[] = [
    "truck",
    "van",
    "cargo_ship",
    "rail",
    "air_freight",
  ];

  const cargoSpecializations: CargoSpecialization[] = [
    "fragile",
    "refrigerated",
    "hazmat",
    "oversized",
    "standard",
  ];

  const deliverySpeeds: DeliverySpeed[] = [
    "same_day",
    "next_day",
    "standard",
    "economy",
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky lg:top-4 left-0 top-0 h-full lg:h-auto w-80 bg-white dark:bg-gray-900 border-r lg:border lg:rounded-xl border-gray-200 dark:border-gray-700 z-50 lg:z-auto overflow-y-auto transition-transform lg:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Clear all
              </button>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Service Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Area
            </label>
            <input
              type="text"
              placeholder="Enter location..."
              value={filters.location}
              onChange={(e) =>
                onFiltersChange({ ...filters, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Vehicle Types */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle Types
            </label>
            <div className="space-y-2">
              {vehicleTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.vehicleTypes.includes(type)}
                    onChange={() => handleVehicleTypeChange(type)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {vehicleTypeLabels[type]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Cargo Specializations */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cargo Specializations
            </label>
            <div className="space-y-2">
              {cargoSpecializations.map((spec) => (
                <label
                  key={spec}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.cargoSpecializations.includes(spec)}
                    onChange={() => handleCargoSpecChange(spec)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {cargoSpecializationLabels[spec]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      minRating: filters.minRating === star ? 0 : star,
                    })
                  }
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded transition-colors",
                    star <= filters.minRating
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  )}
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {filters.minRating > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  & up
                </span>
              )}
            </div>
          </div>

          {/* Insurance Coverage */}
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Insurance Coverage
              </span>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    hasInsurance:
                      filters.hasInsurance === true
                        ? null
                        : filters.hasInsurance === false
                        ? true
                        : true,
                  })
                }
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  filters.hasInsurance === true
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    filters.hasInsurance === true
                      ? "translate-x-6"
                      : "translate-x-1"
                  )}
                />
              </button>
            </label>
          </div>

          {/* Verified Only */}
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Verified Carriers Only
              </span>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    verifiedOnly: !filters.verifiedOnly,
                  })
                }
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  filters.verifiedOnly
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    filters.verifiedOnly ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </label>
          </div>

          {/* Available Now */}
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Available Now
              </span>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    availableNow: !filters.availableNow,
                  })
                }
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  filters.availableNow
                    ? "bg-green-600"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    filters.availableNow ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </label>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price Range (per mile)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ${filters.priceRange[0]}
              </span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: [filters.priceRange[0], parseFloat(e.target.value)],
                  })
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ${filters.priceRange[1]}
              </span>
            </div>
          </div>

          {/* Delivery Speed */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Speed
            </label>
            <div className="space-y-2">
              {deliverySpeeds.map((speed) => (
                <label
                  key={speed}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.deliverySpeed.includes(speed)}
                    onChange={() => handleDeliverySpeedChange(speed)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {deliverySpeedLabels[speed]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CarrierFilterSidebar;
