'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Carrier,
  CarrierFilters,
  SortOption,
  ViewMode,
  defaultFilters,
} from '@/components/carriers/types';
import { CarrierCard } from '@/components/carriers/CarrierCard';
import { CarrierSearchHeader } from '@/components/carriers/CarrierSearchHeader';
import { CarrierFiltersPanel } from '@/components/carriers/CarrierFiltersPanel';
import { CarrierComparisonModal } from '@/components/carriers/CarrierComparisonModal';
import { ContactCarrierModal, ContactFormData } from '@/components/carriers/ContactCarrierModal';

// Mock data for demonstration
const mockCarriers: Carrier[] = [
  {
    id: '1',
    name: 'Swift Logistics',
    rating: 4.8,
    reviewCount: 256,
    location: 'Los Angeles, CA',
    serviceAreas: ['California', 'Nevada', 'Arizona'],
    vehicleTypes: ['truck', 'van'],
    cargoSpecializations: ['standard', 'fragile'],
    pricePerMile: 2.5,
    deliverySpeed: ['same_day', 'next_day', 'standard'],
    isVerified: true,
    hasInsurance: true,
    isAvailableNow: true,
    yearsInBusiness: 12,
    completedDeliveries: 15420,
    onTimeRate: 98,
    description: 'Premier logistics provider with a focus on speed and reliability.',
  },
  {
    id: '2',
    name: 'ColdChain Express',
    rating: 4.6,
    reviewCount: 189,
    location: 'Chicago, IL',
    serviceAreas: ['Illinois', 'Indiana', 'Wisconsin', 'Michigan'],
    vehicleTypes: ['truck', 'van'],
    cargoSpecializations: ['refrigerated', 'fragile'],
    pricePerMile: 3.2,
    deliverySpeed: ['next_day', 'standard'],
    isVerified: true,
    hasInsurance: true,
    isAvailableNow: false,
    yearsInBusiness: 8,
    completedDeliveries: 8750,
    onTimeRate: 96,
    description: 'Specialized in temperature-controlled logistics.',
  },
  {
    id: '3',
    name: 'HeavyHaul Transport',
    rating: 4.9,
    reviewCount: 98,
    location: 'Houston, TX',
    serviceAreas: ['Texas', 'Louisiana', 'Oklahoma', 'New Mexico'],
    vehicleTypes: ['truck', 'rail'],
    cargoSpecializations: ['oversized', 'standard', 'hazmat'],
    pricePerMile: 4.5,
    deliverySpeed: ['standard', 'economy'],
    isVerified: true,
    hasInsurance: true,
    isAvailableNow: true,
    yearsInBusiness: 20,
    completedDeliveries: 5230,
    onTimeRate: 99,
    description: 'Experts in oversized and heavy cargo transportation.',
  },
  {
    id: '4',
    name: 'AirCargo Solutions',
    rating: 4.5,
    reviewCount: 312,
    location: 'Miami, FL',
    serviceAreas: ['Florida', 'Georgia', 'South Carolina'],
    vehicleTypes: ['air_freight', 'van'],
    cargoSpecializations: ['fragile', 'standard'],
    pricePerMile: 5.8,
    deliverySpeed: ['same_day', 'next_day'],
    isVerified: true,
    hasInsurance: true,
    isAvailableNow: true,
    yearsInBusiness: 6,
    completedDeliveries: 22100,
    onTimeRate: 94,
    description: 'Fast air freight services for urgent deliveries.',
  },
  {
    id: '5',
    name: 'Maritime Movers',
    rating: 4.3,
    reviewCount: 67,
    location: 'Seattle, WA',
    serviceAreas: ['Washington', 'Oregon', 'Alaska'],
    vehicleTypes: ['cargo_ship', 'truck'],
    cargoSpecializations: ['oversized', 'standard'],
    pricePerMile: 1.8,
    deliverySpeed: ['economy'],
    isVerified: false,
    hasInsurance: true,
    isAvailableNow: false,
    yearsInBusiness: 15,
    completedDeliveries: 3400,
    onTimeRate: 91,
    description: 'Cost-effective shipping via sea freight.',
  },
  {
    id: '6',
    name: 'Metro Express',
    rating: 4.7,
    reviewCount: 445,
    location: 'New York, NY',
    serviceAreas: ['New York', 'New Jersey', 'Connecticut', 'Pennsylvania'],
    vehicleTypes: ['van', 'truck'],
    cargoSpecializations: ['standard', 'fragile'],
    pricePerMile: 2.9,
    deliverySpeed: ['same_day', 'next_day', 'standard'],
    isVerified: true,
    hasInsurance: true,
    isAvailableNow: true,
    yearsInBusiness: 10,
    completedDeliveries: 31500,
    onTimeRate: 97,
    description: 'Metro area specialist with rapid delivery options.',
  },
];

export default function CarriersPage() {
  // State
  const [filters, setFilters] = useState<CarrierFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [contactingCarrier, setContactingCarrier] = useState<Carrier | null>(null);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery !== '' ||
      filters.serviceArea !== '' ||
      filters.vehicleTypes.length > 0 ||
      filters.cargoSpecializations.length > 0 ||
      filters.minRating > 0 ||
      filters.hasInsurance !== null ||
      filters.verifiedOnly ||
      filters.availableNow ||
      filters.priceRange[0] !== 0 ||
      filters.priceRange[1] !== 10 ||
      filters.deliverySpeed.length > 0
    );
  }, [filters]);

  // Filter and sort carriers
  const filteredCarriers = useMemo(() => {
    let result = mockCarriers.map((carrier) => ({
      ...carrier,
      isFavorite: favorites.has(carrier.id),
    }));

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query) ||
          c.serviceAreas.some((a) => a.toLowerCase().includes(query))
      );
    }

    if (filters.serviceArea) {
      const area = filters.serviceArea.toLowerCase();
      result = result.filter(
        (c) =>
          c.location.toLowerCase().includes(area) ||
          c.serviceAreas.some((a) => a.toLowerCase().includes(area))
      );
    }

    if (filters.vehicleTypes.length > 0) {
      result = result.filter((c) =>
        filters.vehicleTypes.some((t) => c.vehicleTypes.includes(t))
      );
    }

    if (filters.cargoSpecializations.length > 0) {
      result = result.filter((c) =>
        filters.cargoSpecializations.some((s) => c.cargoSpecializations.includes(s))
      );
    }

    if (filters.minRating > 0) {
      result = result.filter((c) => c.rating >= filters.minRating);
    }

    if (filters.hasInsurance !== null) {
      result = result.filter((c) => c.hasInsurance === filters.hasInsurance);
    }

    if (filters.verifiedOnly) {
      result = result.filter((c) => c.isVerified);
    }

    if (filters.availableNow) {
      result = result.filter((c) => c.isAvailableNow);
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10) {
      result = result.filter(
        (c) =>
          c.pricePerMile >= filters.priceRange[0] &&
          c.pricePerMile <= filters.priceRange[1]
      );
    }

    if (filters.deliverySpeed.length > 0) {
      result = result.filter((c) =>
        filters.deliverySpeed.some((s) => c.deliverySpeed.includes(s))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        result.sort((a, b) => a.pricePerMile - b.pricePerMile);
        break;
      case 'price_high':
        result.sort((a, b) => b.pricePerMile - a.pricePerMile);
        break;
      case 'availability':
        result.sort((a, b) => (b.isAvailableNow ? 1 : 0) - (a.isAvailableNow ? 1 : 0));
        break;
      // Distance would require geo calculation, sorting by location for now
      case 'distance':
        result.sort((a, b) => a.location.localeCompare(b.location));
        break;
    }

    return result;
  }, [filters, sortBy, favorites]);

  // Handlers
  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleToggleFavorite = useCallback((carrierId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(carrierId)) {
        next.delete(carrierId);
      } else {
        next.add(carrierId);
      }
      return next;
    });
  }, []);

  const handleToggleComparison = useCallback((carrierId: string) => {
    setSelectedForComparison((prev) => {
      const next = new Set(prev);
      if (next.has(carrierId)) {
        next.delete(carrierId);
      } else if (next.size < 4) {
        next.add(carrierId);
      }
      return next;
    });
  }, []);

  const handleContactCarrier = useCallback((carrier: Carrier) => {
    setContactingCarrier(carrier);
  }, []);

  const handleContactSubmit = useCallback((data: ContactFormData) => {
    // In a real app, this would submit to an API
    console.log('Contact form submitted:', data);
    setContactingCarrier(null);
    // Show success toast here
  }, []);

  const carriersForComparison = useMemo(() => {
    return filteredCarriers.filter((c) => selectedForComparison.has(c.id));
  }, [filteredCarriers, selectedForComparison]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Carrier Directory
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Discover and compare freight carriers for your shipping needs
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search header */}
        <CarrierSearchHeader
          searchQuery={filters.searchQuery}
          onSearchChange={(query) => setFilters((f) => ({ ...f, searchQuery: query }))}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultsCount={filteredCarriers.length}
          onOpenFilters={() => setIsFiltersPanelOpen(true)}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="flex gap-6">
          {/* Filters sidebar - visible on lg screens */}
          <div className="hidden lg:block">
            <CarrierFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={true}
              onClose={() => setIsFiltersPanelOpen(false)}
            />
          </div>

          {/* Mobile filters panel */}
          <div className="lg:hidden">
            <CarrierFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={isFiltersPanelOpen}
              onClose={() => setIsFiltersPanelOpen(false)}
            />
          </div>

          {/* Carrier grid/list */}
          <div className="flex-1">
            {filteredCarriers.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  No carriers found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                    : 'space-y-4'
                )}
              >
                {filteredCarriers.map((carrier) => (
                  <CarrierCard
                    key={carrier.id}
                    carrier={carrier}
                    viewMode={viewMode}
                    onContact={handleContactCarrier}
                    onToggleFavorite={handleToggleFavorite}
                    onCompare={handleToggleComparison}
                    isSelected={selectedForComparison.has(carrier.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comparison floating bar */}
        {selectedForComparison.size > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center gap-4 z-30">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedForComparison.size} carrier{selectedForComparison.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setShowComparisonModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
            >
              Compare
            </button>
            <button
              onClick={() => setSelectedForComparison(new Set())}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <svg
                className="w-4 h-4 text-gray-500"
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
        )}
      </main>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <CarrierComparisonModal
          carriers={carriersForComparison}
          onClose={() => setShowComparisonModal(false)}
          onRemoveCarrier={(id) => handleToggleComparison(id)}
        />
      )}

      {/* Contact Modal */}
      <ContactCarrierModal
        carrier={contactingCarrier}
        onClose={() => setContactingCarrier(null)}
        onSubmit={handleContactSubmit}
      />
    </div>
  );
}
