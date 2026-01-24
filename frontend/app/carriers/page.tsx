"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/buttons";
import Card from "@/components/ui/Card";

// Types
interface Carrier {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  location: string;
  vehicleTypes: VehicleType[];
  specializations: CargoSpecialization[];
  pricePerMile: number;
  isVerified: boolean;
  isAvailable: boolean;
  hasInsurance: boolean;
  deliverySpeed: DeliverySpeed[];
  description: string;
}

type VehicleType = "truck" | "van" | "cargo_ship" | "rail" | "air_freight";
type CargoSpecialization = "fragile" | "refrigerated" | "hazmat" | "oversized" | "standard";
type DeliverySpeed = "same_day" | "next_day" | "standard" | "economy";
type SortOption = "rating" | "price" | "distance" | "availability";
type ViewMode = "grid" | "list";

interface Filters {
  searchQuery: string;
  vehicleTypes: VehicleType[];
  specializations: CargoSpecialization[];
  minRating: number;
  hasInsurance: boolean | null;
  verifiedOnly: boolean;
  availableNow: boolean;
  priceRange: [number, number];
  deliverySpeed: DeliverySpeed[];
}

// Mock data for carriers
const mockCarriers: Carrier[] = [
  {
    id: "1",
    name: "FastFreight Logistics",
    rating: 4.8,
    reviewCount: 234,
    location: "Los Angeles, CA",
    vehicleTypes: ["truck", "van"],
    specializations: ["standard", "fragile"],
    pricePerMile: 2.5,
    isVerified: true,
    isAvailable: true,
    hasInsurance: true,
    deliverySpeed: ["same_day", "next_day", "standard"],
    description: "Reliable freight services across the West Coast with 15+ years of experience.",
  },
  {
    id: "2",
    name: "CoolChain Transport",
    rating: 4.6,
    reviewCount: 189,
    location: "Chicago, IL",
    vehicleTypes: ["truck"],
    specializations: ["refrigerated", "fragile"],
    pricePerMile: 3.2,
    isVerified: true,
    isAvailable: true,
    hasInsurance: true,
    deliverySpeed: ["next_day", "standard"],
    description: "Specialized in temperature-controlled logistics for perishable goods.",
  },
  {
    id: "3",
    name: "HeavyHaul Inc",
    rating: 4.4,
    reviewCount: 156,
    location: "Houston, TX",
    vehicleTypes: ["truck", "rail"],
    specializations: ["oversized", "hazmat"],
    pricePerMile: 4.0,
    isVerified: true,
    isAvailable: false,
    hasInsurance: true,
    deliverySpeed: ["standard", "economy"],
    description: "Expert handling of oversized and hazardous materials nationwide.",
  },
  {
    id: "4",
    name: "Express Van Services",
    rating: 4.2,
    reviewCount: 98,
    location: "Miami, FL",
    vehicleTypes: ["van"],
    specializations: ["standard", "fragile"],
    pricePerMile: 1.8,
    isVerified: false,
    isAvailable: true,
    hasInsurance: true,
    deliverySpeed: ["same_day", "next_day"],
    description: "Quick and affordable last-mile delivery solutions.",
  },
  {
    id: "5",
    name: "Global Air Cargo",
    rating: 4.9,
    reviewCount: 312,
    location: "New York, NY",
    vehicleTypes: ["air_freight"],
    specializations: ["fragile", "standard"],
    pricePerMile: 8.5,
    isVerified: true,
    isAvailable: true,
    hasInsurance: true,
    deliverySpeed: ["same_day", "next_day"],
    description: "Premium air freight services for time-critical shipments worldwide.",
  },
  {
    id: "6",
    name: "Maritime Movers",
    rating: 4.3,
    reviewCount: 145,
    location: "Seattle, WA",
    vehicleTypes: ["cargo_ship"],
    specializations: ["oversized", "standard"],
    pricePerMile: 0.8,
    isVerified: true,
    isAvailable: true,
    hasInsurance: true,
    deliverySpeed: ["economy"],
    description: "Cost-effective ocean freight for large volume shipments.",
  },
];

const vehicleTypeLabels: Record<VehicleType, string> = {
  truck: "Truck",
  van: "Van",
  cargo_ship: "Cargo Ship",
  rail: "Rail",
  air_freight: "Air Freight",
};

const specializationLabels: Record<CargoSpecialization, string> = {
  fragile: "Fragile",
  refrigerated: "Refrigerated",
  hazmat: "Hazmat",
  oversized: "Oversized",
  standard: "Standard",
};

const deliverySpeedLabels: Record<DeliverySpeed, string> = {
  same_day: "Same Day",
  next_day: "Next Day",
  standard: "Standard",
  economy: "Economy",
};

// Star Rating Component
const StarRating: React.FC<{ rating: number; size?: "sm" | "md" }> = ({
  rating,
  size = "md",
}) => {
  const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            starSize,
            star <= rating ? "text-yellow-400" : "text-gray-300"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// Carrier Card Component
const CarrierCard: React.FC<{
  carrier: Carrier;
  viewMode: ViewMode;
  onContact: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  isComparing: boolean;
  onToggleCompare: (id: string) => void;
}> = ({
  carrier,
  viewMode,
  onContact,
  onToggleFavorite,
  isFavorite,
  isComparing,
  onToggleCompare,
}) => {
  const isGrid = viewMode === "grid";

  return (
    <Card
      className={cn(
        "relative transition-all hover:shadow-lg",
        isGrid ? "flex flex-col" : "flex flex-row items-center gap-4"
      )}
      variant="bordered"
    >
      {/* Favorite Button */}
      <button
        onClick={() => onToggleFavorite(carrier.id)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <svg
          className={cn("w-5 h-5", isFavorite ? "text-red-500 fill-red-500" : "text-gray-400")}
          fill={isFavorite ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Company Logo/Avatar */}
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold rounded-lg",
          isGrid ? "w-16 h-16 mx-auto mt-2" : "w-20 h-20 flex-shrink-0"
        )}
      >
        {carrier.logo ? (
          <img src={carrier.logo} alt={carrier.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-2xl">{carrier.name.charAt(0)}</span>
        )}
      </div>

      <div className={cn("flex-1", isGrid ? "text-center" : "")}>
        {/* Company Name & Verification */}
        <div className={cn("flex items-center gap-2", isGrid ? "justify-center" : "")}>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {carrier.name}
          </h3>
          {carrier.isVerified && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Verified
            </span>
          )}
        </div>

        {/* Location */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {carrier.location}
        </p>

        {/* Rating */}
        <div className={cn("mt-2", isGrid ? "flex justify-center" : "")}>
          <StarRating rating={carrier.rating} size="sm" />
          <span className="ml-2 text-sm text-gray-500">({carrier.reviewCount} reviews)</span>
        </div>

        {/* Vehicle Types & Specializations */}
        <div className="flex flex-wrap gap-1 mt-3 justify-center">
          {carrier.vehicleTypes.slice(0, 3).map((type) => (
            <span
              key={type}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {vehicleTypeLabels[type]}
            </span>
          ))}
        </div>

        {/* Price & Availability */}
        <div className={cn("flex items-center gap-4 mt-3", isGrid ? "justify-center" : "")}>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ${carrier.pricePerMile.toFixed(2)}/mi
          </span>
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
              carrier.isAvailable
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            )}
          >
            {carrier.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className={cn("flex gap-2 mt-4", isGrid ? "justify-center" : "")}>
          <Button size="sm" onClick={() => onContact(carrier.id)}>
            Contact
          </Button>
          <Button
            size="sm"
            variant={isComparing ? "default" : "outline"}
            onClick={() => onToggleCompare(carrier.id)}
          >
            {isComparing ? "Comparing" : "Compare"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Filter Sidebar Component
const FiltersSidebar: React.FC<{
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ filters, onFilterChange, isOpen, onClose }) => {
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <T extends string>(
    key: keyof Pick<Filters, "vehicleTypes" | "specializations" | "deliverySpeed">,
    value: T
  ) => {
    const currentArray = filters[key] as T[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as Filters[typeof key]);
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 dark:lg:border-gray-700",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Vehicle Types */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Vehicle Types
          </h3>
          <div className="space-y-2">
            {(Object.keys(vehicleTypeLabels) as VehicleType[]).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.vehicleTypes.includes(type)}
                  onChange={() => toggleArrayFilter("vehicleTypes", type)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Cargo Specializations
          </h3>
          <div className="space-y-2">
            {(Object.keys(specializationLabels) as CargoSpecialization[]).map((spec) => (
              <label key={spec} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.specializations.includes(spec)}
                  onChange={() => toggleArrayFilter("specializations", spec)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {specializationLabels[spec]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Minimum Rating
          </h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateFilter("minRating", star)}
                className={cn(
                  "p-1 rounded transition-colors",
                  filters.minRating >= star ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                )}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="mb-6 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">Insurance Coverage</span>
            <input
              type="checkbox"
              checked={filters.hasInsurance === true}
              onChange={(e) => updateFilter("hasInsurance", e.target.checked ? true : null)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">Verified Only</span>
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => updateFilter("verifiedOnly", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">Available Now</span>
            <input
              type="checkbox"
              checked={filters.availableNow}
              onChange={(e) => updateFilter("availableNow", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </label>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Price Range ($/mile)
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) =>
                updateFilter("priceRange", [Number(e.target.value), filters.priceRange[1]])
              }
              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              min={0}
              step={0.1}
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) =>
                updateFilter("priceRange", [filters.priceRange[0], Number(e.target.value)])
              }
              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              min={0}
              step={0.1}
            />
          </div>
        </div>

        {/* Delivery Speed */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Delivery Speed
          </h3>
          <div className="space-y-2">
            {(Object.keys(deliverySpeedLabels) as DeliverySpeed[]).map((speed) => (
              <label key={speed} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.deliverySpeed.includes(speed)}
                  onChange={() => toggleArrayFilter("deliverySpeed", speed)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {deliverySpeedLabels[speed]}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Carriers Page Component
export default function CarriersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Filters>({
    searchQuery: "",
    vehicleTypes: [],
    specializations: [],
    minRating: 0,
    hasInsurance: null,
    verifiedOnly: false,
    availableNow: false,
    priceRange: [0, 10],
    deliverySpeed: [],
  });

  // Filter and sort carriers
  const filteredCarriers = useMemo(() => {
    let result = [...mockCarriers];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    }

    // Vehicle types filter
    if (filters.vehicleTypes.length > 0) {
      result = result.filter((c) =>
        filters.vehicleTypes.some((t) => c.vehicleTypes.includes(t))
      );
    }

    // Specializations filter
    if (filters.specializations.length > 0) {
      result = result.filter((c) =>
        filters.specializations.some((s) => c.specializations.includes(s))
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter((c) => c.rating >= filters.minRating);
    }

    // Insurance filter
    if (filters.hasInsurance === true) {
      result = result.filter((c) => c.hasInsurance);
    }

    // Verified filter
    if (filters.verifiedOnly) {
      result = result.filter((c) => c.isVerified);
    }

    // Available filter
    if (filters.availableNow) {
      result = result.filter((c) => c.isAvailable);
    }

    // Price range filter
    result = result.filter(
      (c) =>
        c.pricePerMile >= filters.priceRange[0] &&
        c.pricePerMile <= filters.priceRange[1]
    );

    // Delivery speed filter
    if (filters.deliverySpeed.length > 0) {
      result = result.filter((c) =>
        filters.deliverySpeed.some((s) => c.deliverySpeed.includes(s))
      );
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price":
        result.sort((a, b) => a.pricePerMile - b.pricePerMile);
        break;
      case "availability":
        result.sort((a, b) => (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0));
        break;
    }

    return result;
  }, [filters, sortBy]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setComparing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const handleContact = (id: string) => {
    // In a real app, this would open a contact modal or navigate to a contact page
    console.log("Contact carrier:", id);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      vehicleTypes: [],
      specializations: [],
      minRating: 0,
      hasInsurance: null,
      verifiedOnly: false,
      availableNow: false,
      priceRange: [0, 10],
      deliverySpeed: [],
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.vehicleTypes.length > 0 ||
    filters.specializations.length > 0 ||
    filters.minRating > 0 ||
    filters.hasInsurance !== null ||
    filters.verifiedOnly ||
    filters.availableNow ||
    filters.deliverySpeed.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Carrier Directory
          </h1>

          {/* Search & Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, location, or services..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Filter Button (Mobile) */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsFilterOpen(true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
              </Button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="rating">Sort by Rating</option>
                <option value="price">Sort by Price</option>
                <option value="availability">Sort by Availability</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  aria-label="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  aria-label="List view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {filteredCarriers.length} carrier{filteredCarriers.length !== 1 ? "s" : ""} found
            {comparing.size > 0 && (
              <span className="ml-4 text-blue-600 dark:text-blue-400">
                {comparing.size} selected for comparison
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Filters Sidebar */}
        <FiltersSidebar
          filters={filters}
          onFilterChange={setFilters}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        {/* Overlay for mobile */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        {/* Carriers Grid/List */}
        <main className="flex-1 p-4 lg:p-6">
          {filteredCarriers.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                No carriers found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search query.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "flex flex-col gap-4"
              )}
            >
              {filteredCarriers.map((carrier) => (
                <CarrierCard
                  key={carrier.id}
                  carrier={carrier}
                  viewMode={viewMode}
                  onContact={handleContact}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.has(carrier.id)}
                  isComparing={comparing.has(carrier.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
