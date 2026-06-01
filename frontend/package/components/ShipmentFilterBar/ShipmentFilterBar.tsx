"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce, useFilterState } from "./useFilterState";
import { STATUS_OPTIONS, COUNTRY_OPTIONS, ShipmentFilters } from "./types";
import { ShipmentStatus } from "../../../types/shipment.types";

interface ShipmentFilterBarProps {
  onFilterChange?: (filters: ShipmentFilters) => void;
}

export function ShipmentFilterBar({ onFilterChange }: ShipmentFilterBarProps) {
  const { filters, updateFilters, clearFilters, activeFilterCount } =
    useFilterState();
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Debounce search input by 400ms
  const debouncedSearch = useDebounce(localSearch, 400);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilters({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch]);

  // Sync local search with URL filters
  useEffect(() => {
    if (filters.search !== localSearch) {
      setLocalSearch(filters.search || "");
    }
  }, [filters.search]);

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleStatusToggle = (status: ShipmentStatus) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter((s) => s !== status)
      : [...currentStatus, status];

    updateFilters({ status: newStatus.length > 0 ? newStatus : undefined });
  };

  const handleDateFromChange = (date: string) => {
    updateFilters({ dateFrom: date || undefined });
  };

  const handleDateToChange = (date: string) => {
    updateFilters({ dateTo: date || undefined });
  };

  const handleCountryChange = (country: string) => {
    updateFilters({ originCountry: country || undefined });
  };

  const selectedStatusLabels = useMemo(() => {
    if (!filters.status || filters.status.length === 0) return [];
    return filters.status
      .map((s) => STATUS_OPTIONS.find((opt) => opt.value === s)?.label)
      .filter(Boolean) as string[];
  }, [filters.status]);

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap gap-3 items-start">
        {/* Search Input */}
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by tracking number, origin, destination, or cargo..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status Multi-Select Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              filters.status && filters.status.length > 0
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background text-foreground hover:bg-accent"
            }`}
          >
            Status
            {filters.status && filters.status.length > 0 && (
              <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {filters.status.length}
              </span>
            )}
          </button>

          {statusDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStatusDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 rounded-lg border border-border bg-background shadow-lg z-20 p-3 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Filter by Status
                </div>
                <div className="space-y-1">
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = filters.status?.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected || false}
                          onChange={() => handleStatusToggle(option.value)}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-foreground">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="From date"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="To date"
          />
        </div>

        {/* Origin Country Select */}
        <select
          value={filters.originCountry || ""}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Origin country"
        >
          <option value="">All Countries</option>
          {COUNTRY_OPTIONS.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>

        {/* Clear All Filters Button */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Clear All
          </button>
        )}

        {/* Active Filter Count Badge */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-semibold">
              {activeFilterCount}{" "}
              {activeFilterCount === 1 ? "filter" : "filters"} active
            </span>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium">
            Active filters:
          </span>

          {/* Search Filter Tag */}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Search: "{filters.search}"
              <button
                type="button"
                onClick={() => updateFilters({ search: undefined })}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                aria-label="Remove search filter"
              >
                <svg
                  className="w-3 h-3"
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
            </span>
          )}

          {/* Status Filter Tags */}
          {selectedStatusLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              Status: {label}
              <button
                type="button"
                onClick={() => {
                  const statusToRemove = STATUS_OPTIONS.find(
                    (opt) => opt.label === label,
                  )?.value;
                  if (statusToRemove) {
                    const newStatus = (filters.status || []).filter(
                      (s) => s !== statusToRemove,
                    );
                    updateFilters({
                      status: newStatus.length > 0 ? newStatus : undefined,
                    });
                  }
                }}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                aria-label={`Remove ${label} status filter`}
              >
                <svg
                  className="w-3 h-3"
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
            </span>
          ))}

          {/* Date Range Filter Tag */}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Date:{filters.dateFrom && ` ${filters.dateFrom}`}
              {filters.dateTo && ` to ${filters.dateTo}`}
              <button
                type="button"
                onClick={() =>
                  updateFilters({ dateFrom: undefined, dateTo: undefined })
                }
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                aria-label="Remove date filter"
              >
                <svg
                  className="w-3 h-3"
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
            </span>
          )}

          {/* Country Filter Tag */}
          {filters.originCountry && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Country:{" "}
              {
                COUNTRY_OPTIONS.find((c) => c.value === filters.originCountry)
                  ?.label
              }
              <button
                type="button"
                onClick={() => updateFilters({ originCountry: undefined })}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                aria-label="Remove country filter"
              >
                <svg
                  className="w-3 h-3"
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
            </span>
          )}
        </div>
      )}
    </div>
  );
}
