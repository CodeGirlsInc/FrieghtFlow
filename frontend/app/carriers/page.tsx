"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Carrier,
  CarrierFilters,
  SortOption,
  ViewMode,
  defaultFilters,
} from "@/types/carrier";
import {
  CarrierCard,
  CarrierFilterSidebar,
  CarrierSearchHeader,
  CarrierComparisonModal,
  CarrierContactModal,
} from "@/components/carriers";

// Mock data for demonstration
const mockCarriers: Carrier[] = [
  {
    id: "1",
    name: "Swift Logistics",
    rating: 4.8,
    reviewCount: 234,
    location: "Los Angeles, CA",
    vehicleTypes: ["truck", "van"],
    cargoSpecializations: ["standard", "fragile"],
    pricePerMile: 2.5,
    isVerified: true,
    hasInsurance: true,
    isAvailable: true,
    deliverySpeed: ["same_day", "next_day"],
    description:
      "Premium freight services with over 15 years of experience. Specializing in time-critical deliveries.",
    contactEmail: "contact@swiftlogistics.com",
    contactPhone: "+1 (555) 123-4567",
    yearsInBusiness: 15,
    completedShipments: 12500,
  },
  {
    id: "2",
    name: "Arctic Cold Chain",
    rating: 4.6,
    reviewCount: 189,
    location: "Chicago, IL",
    vehicleTypes: ["truck", "van", "rail"],
    cargoSpecializations: ["refrigerated", "fragile"],
    pricePerMile: 3.2,
    isVerified: true,
    hasInsurance: true,
    isAvailable: true,
    deliverySpeed: ["standard", "economy"],
    description:
      "Specialized in temperature-controlled logistics. FDA-compliant cold chain solutions.",
    contactEmail: "info@arcticcoldchain.com",
    contactPhone: "+1 (555) 234-5678",
    yearsInBusiness: 8,
    completedShipments: 5600,
  },
  {
    id: "3",
    name: "Titan Freight",
    rating: 4.3,
    reviewCount: 156,
    location: "Houston, TX",
    vehicleTypes: ["truck", "cargo_ship", "rail"],
    cargoSpecializations: ["oversized", "hazmat", "standard"],
    pricePerMile: 4.0,
    isVerified: true,
    hasInsurance: true,
    isAvailable: false,
    deliverySpeed: ["standard", "economy"],
    description:
      "Heavy haul and oversized cargo specialists. Fully licensed for hazmat transport.",
    contactEmail: "dispatch@titanfreight.com",
    contactPhone: "+1 (555) 345-6789",
    yearsInBusiness: 22,
    completedShipments: 8900,
  },
  {
    id: "4",
    name: "Express Air Cargo",
    rating: 4.9,
    reviewCount: 312,
    location: "Miami, FL",
    vehicleTypes: ["air_freight", "van"],
    cargoSpecializations: ["fragile", "standard"],
    pricePerMile: 5.5,
    isVerified: true,
    hasInsurance: true,
    isAvailable: true,
    deliverySpeed: ["same_day", "next_day"],
    description:
      "International air freight experts. Guaranteed same-day delivery for urgent shipments.",
    contactEmail: "bookings@expressaircargo.com",
    contactPhone: "+1 (555) 456-7890",
    yearsInBusiness: 12,
    completedShipments: 18200,
  },
  {
    id: "5",
    name: "Coastal Shipping Co",
    rating: 4.2,
    reviewCount: 98,
    location: "Seattle, WA",
    vehicleTypes: ["cargo_ship", "truck"],
    cargoSpecializations: ["standard", "oversized"],
    pricePerMile: 1.8,
    isVerified: false,
    hasInsurance: true,
    isAvailable: true,
    deliverySpeed: ["standard", "economy"],
    description:
      "Maritime and intermodal shipping solutions. Cost-effective for bulk cargo.",
    contactEmail: "sales@coastalshipping.com",
    contactPhone: "+1 (555) 567-8901",
    yearsInBusiness: 18,
    completedShipments: 4200,
  },
  {
    id: "6",
    name: "Metro Van Lines",
    rating: 4.5,
    reviewCount: 267,
    location: "New York, NY",
    vehicleTypes: ["van", "truck"],
    cargoSpecializations: ["fragile", "standard"],
    pricePerMile: 2.1,
    isVerified: true,
    hasInsurance: true,
    isAvailable: true,
    deliverySpeed: ["same_day", "next_day", "standard"],
    description:
      "Urban delivery specialists. Same-day service throughout the NYC metro area.",
    contactEmail: "hello@metrovanlines.com",
    contactPhone: "+1 (555) 678-9012",
    yearsInBusiness: 6,
    completedShipments: 9800,
  },
];

export default function CarriersPage() {
  const [filters, setFilters] = useState<CarrierFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bookmarkedCarriers, setBookmarkedCarriers] = useState<Set<string>>(
    new Set()
  );
  const [compareCarrierIds, setCompareCarrierIds] = useState<Set<string>>(
    new Set()
  );
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [contactCarrier, setContactCarrier] = useState<Carrier | null>(null);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.location !== "" ||
      filters.vehicleTypes.length > 0 ||
      filters.cargoSpecializations.length > 0 ||
      filters.minRating > 0 ||
      filters.hasInsurance !== null ||
      filters.verifiedOnly ||
      filters.availableNow ||
      filters.priceRange[1] < 10 ||
      filters.deliverySpeed.length > 0
    );
  }, [filters]);

  const filteredCarriers = useMemo(() => {
    let result = [...mockCarriers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (carrier) =>
          carrier.name.toLowerCase().includes(query) ||
          carrier.location.toLowerCase().includes(query) ||
          carrier.description.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (filters.location) {
      const location = filters.location.toLowerCase();
      result = result.filter((carrier) =>
        carrier.location.toLowerCase().includes(location)
      );
    }

    // Vehicle types filter
    if (filters.vehicleTypes.length > 0) {
      result = result.filter((carrier) =>
        filters.vehicleTypes.some((type) => carrier.vehicleTypes.includes(type))
      );
    }

    // Cargo specializations filter
    if (filters.cargoSpecializations.length > 0) {
      result = result.filter((carrier) =>
        filters.cargoSpecializations.some((spec) =>
          carrier.cargoSpecializations.includes(spec)
        )
      );
    }

    // Minimum rating filter
    if (filters.minRating > 0) {
      result = result.filter((carrier) => carrier.rating >= filters.minRating);
    }

    // Insurance filter
    if (filters.hasInsurance !== null) {
      result = result.filter(
        (carrier) => carrier.hasInsurance === filters.hasInsurance
      );
    }

    // Verified only filter
    if (filters.verifiedOnly) {
      result = result.filter((carrier) => carrier.isVerified);
    }

    // Available now filter
    if (filters.availableNow) {
      result = result.filter((carrier) => carrier.isAvailable);
    }

    // Price range filter
    result = result.filter(
      (carrier) =>
        carrier.pricePerMile >= filters.priceRange[0] &&
        carrier.pricePerMile <= filters.priceRange[1]
    );

    // Delivery speed filter
    if (filters.deliverySpeed.length > 0) {
      result = result.filter((carrier) =>
        filters.deliverySpeed.some((speed) =>
          carrier.deliverySpeed.includes(speed)
        )
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price":
          return a.pricePerMile - b.pricePerMile;
        case "availability":
          return (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0);
        case "distance":
          // For demo, just sort by name since we don't have actual distance
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [filters, searchQuery, sortBy]);

  const compareCarriers = useMemo(() => {
    return mockCarriers.filter((carrier) => compareCarrierIds.has(carrier.id));
  }, [compareCarrierIds]);

  const handleBookmark = (carrierId: string) => {
    setBookmarkedCarriers((prev) => {
      const next = new Set(prev);
      if (next.has(carrierId)) {
        next.delete(carrierId);
      } else {
        next.add(carrierId);
      }
      return next;
    });
  };

  const handleCompare = (carrierId: string) => {
    setCompareCarrierIds((prev) => {
      const next = new Set(prev);
      if (next.has(carrierId)) {
        next.delete(carrierId);
      } else if (next.size < 4) {
        next.add(carrierId);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Carrier Directory
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Find and compare carriers for your shipping needs
              </p>
            </div>

            {compareCarrierIds.size > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Compare ({compareCarrierIds.size})
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <CarrierFilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />

          {/* Content */}
          <div className="flex-1">
            {/* Search header */}
            <CarrierSearchHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultsCount={filteredCarriers.length}
              onOpenFilters={() => setIsFilterOpen(true)}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />

            {/* Carrier grid/list */}
            {filteredCarriers.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No carriers found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your search or filters to find more carriers.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "flex flex-col gap-4"
                )}
              >
                {filteredCarriers.map((carrier) => (
                  <CarrierCard
                    key={carrier.id}
                    carrier={carrier}
                    viewMode={viewMode}
                    onContact={setContactCarrier}
                    onBookmark={handleBookmark}
                    onCompare={handleCompare}
                    isBookmarked={bookmarkedCarriers.has(carrier.id)}
                    isComparing={compareCarrierIds.has(carrier.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Comparison modal */}
      <CarrierComparisonModal
        carriers={compareCarriers}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveCarrier={(id) => handleCompare(id)}
        onContactCarrier={setContactCarrier}
      />

      {/* Contact modal */}
      <CarrierContactModal
        carrier={contactCarrier}
        isOpen={contactCarrier !== null}
        onClose={() => setContactCarrier(null)}
      />
    </div>
  );
}
