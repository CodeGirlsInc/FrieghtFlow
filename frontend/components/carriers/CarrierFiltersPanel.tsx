'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  CarrierFilters,
  VehicleType,
  CargoSpecialization,
  DeliverySpeed,
  vehicleTypeLabels,
  cargoSpecializationLabels,
  deliverySpeedLabels,
} from './types';

interface CarrierFiltersPanelProps {
  filters: CarrierFilters;
  onFiltersChange: (filters: CarrierFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Checkbox component
function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

// Toggle component
function FilterToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </label>
  );
}

// Star selector component
function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star === value ? 0 : star)}
          className="p-1 hover:scale-110 transition-transform"
          aria-label={`${star} stars minimum`}
        >
          <svg
            className={cn(
              'w-6 h-6',
              star <= value
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-500">& up</span>
      )}
    </div>
  );
}

// Price range slider component
function PriceRangeSlider({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          ${value[0].toFixed(2)}/mile
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          ${value[1].toFixed(2)}/mile
        </span>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-gray-500">Min</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={value[0]}
          onChange={(e) => onChange([parseFloat(e.target.value), value[1]])}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <label className="text-xs text-gray-500">Max</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={value[1]}
          onChange={(e) => onChange([value[0], parseFloat(e.target.value)])}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    </div>
  );
}

export function CarrierFiltersPanel({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
}: CarrierFiltersPanelProps) {
  const updateFilters = (partial: Partial<CarrierFilters>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const toggleVehicleType = (type: VehicleType) => {
    const newTypes = filters.vehicleTypes.includes(type)
      ? filters.vehicleTypes.filter((t) => t !== type)
      : [...filters.vehicleTypes, type];
    updateFilters({ vehicleTypes: newTypes });
  };

  const toggleCargoSpec = (spec: CargoSpecialization) => {
    const newSpecs = filters.cargoSpecializations.includes(spec)
      ? filters.cargoSpecializations.filter((s) => s !== spec)
      : [...filters.cargoSpecializations, spec];
    updateFilters({ cargoSpecializations: newSpecs });
  };

  const toggleDeliverySpeed = (speed: DeliverySpeed) => {
    const newSpeeds = filters.deliverySpeed.includes(speed)
      ? filters.deliverySpeed.filter((s) => s !== speed)
      : [...filters.deliverySpeed, speed];
    updateFilters({ deliverySpeed: newSpeeds });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed lg:static top-0 left-0 h-full lg:h-auto w-80 lg:w-72 bg-white dark:bg-gray-800 border-r lg:border lg:rounded-xl border-gray-200 dark:border-gray-700 z-50 lg:z-auto transition-transform duration-300 overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Service Area */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Service Area
            </label>
            <input
              type="text"
              value={filters.serviceArea}
              onChange={(e) => updateFilters({ serviceArea: e.target.value })}
              placeholder="Enter location..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vehicle Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Vehicle Types
            </h3>
            <div className="space-y-2">
              {(Object.keys(vehicleTypeLabels) as VehicleType[]).map((type) => (
                <FilterCheckbox
                  key={type}
                  label={vehicleTypeLabels[type]}
                  checked={filters.vehicleTypes.includes(type)}
                  onChange={() => toggleVehicleType(type)}
                />
              ))}
            </div>
          </div>

          {/* Cargo Specializations */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Cargo Specializations
            </h3>
            <div className="space-y-2">
              {(Object.keys(cargoSpecializationLabels) as CargoSpecialization[]).map(
                (spec) => (
                  <FilterCheckbox
                    key={spec}
                    label={cargoSpecializationLabels[spec]}
                    checked={filters.cargoSpecializations.includes(spec)}
                    onChange={() => toggleCargoSpec(spec)}
                  />
                )
              )}
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Minimum Rating
            </h3>
            <StarSelector
              value={filters.minRating}
              onChange={(value) => updateFilters({ minRating: value })}
            />
          </div>

          {/* Insurance Coverage */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Insurance Coverage
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="insurance"
                  checked={filters.hasInsurance === null}
                  onChange={() => updateFilters({ hasInsurance: null })}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Any</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="insurance"
                  checked={filters.hasInsurance === true}
                  onChange={() => updateFilters({ hasInsurance: true })}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="insurance"
                  checked={filters.hasInsurance === false}
                  onChange={() => updateFilters({ hasInsurance: false })}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
              </label>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <FilterToggle
              label="Verified Carriers Only"
              checked={filters.verifiedOnly}
              onChange={(checked) => updateFilters({ verifiedOnly: checked })}
            />
            <FilterToggle
              label="Available Now"
              checked={filters.availableNow}
              onChange={(checked) => updateFilters({ availableNow: checked })}
            />
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Price Range (per mile)
            </h3>
            <PriceRangeSlider
              value={filters.priceRange}
              onChange={(value) => updateFilters({ priceRange: value })}
            />
          </div>

          {/* Delivery Speed */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Delivery Speed
            </h3>
            <div className="space-y-2">
              {(Object.keys(deliverySpeedLabels) as DeliverySpeed[]).map((speed) => (
                <FilterCheckbox
                  key={speed}
                  label={deliverySpeedLabels[speed]}
                  checked={filters.deliverySpeed.includes(speed)}
                  onChange={() => toggleDeliverySpeed(speed)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CarrierFiltersPanel;
