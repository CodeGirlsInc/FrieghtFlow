import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShipmentFilters, STATUS_OPTIONS } from "./types";
import { ShipmentStatus } from "../../../types/shipment.types";

/**
 * Custom hook to debounce a value
 * @param value The value to debounce
 * @param delay Debounce delay in milliseconds (default: 400ms)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook to manage filter state with URL query params
 * Syncs filter state with URL for bookmarkable/shareable filtered views
 */
export function useFilterState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial filters from URL
  const initialFilters = useMemo((): ShipmentFilters => {
    const filters: ShipmentFilters = {};

    if (!searchParams) return filters;

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const statusParam = searchParams.get("status");
    if (statusParam) {
      const statuses = statusParam
        .split(",")
        .filter((s) =>
          Object.values(ShipmentStatus).includes(s as ShipmentStatus),
        ) as ShipmentStatus[];
      if (statuses.length > 0) filters.status = statuses;
    }

    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) filters.dateFrom = dateFrom;

    const dateTo = searchParams.get("dateTo");
    if (dateTo) filters.dateTo = dateTo;

    const originCountry = searchParams.get("originCountry");
    if (originCountry) filters.originCountry = originCountry;

    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<ShipmentFilters>(initialFilters);

  // Update URL when filters change
  const updateUrl = useCallback(
    (newFilters: ShipmentFilters) => {
      const params = new URLSearchParams();

      if (newFilters.search) {
        params.set("search", newFilters.search);
      }

      if (newFilters.status && newFilters.status.length > 0) {
        params.set("status", newFilters.status.join(","));
      }

      if (newFilters.dateFrom) {
        params.set("dateFrom", newFilters.dateFrom);
      }

      if (newFilters.dateTo) {
        params.set("dateTo", newFilters.dateTo);
      }

      if (newFilters.originCountry) {
        params.set("originCountry", newFilters.originCountry);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;

      router.push(newUrl, { scroll: false });
    },
    [router],
  );

  // Update filters when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const updateFilters = useCallback(
    (updates: Partial<ShipmentFilters>) => {
      setFilters((prev) => {
        const newFilters = { ...prev, ...updates };
        updateUrl(newFilters);
        return newFilters;
      });
    },
    [updateUrl],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.originCountry) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    activeFilterCount,
  };
}
