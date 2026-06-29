"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { shipmentApi } from "../../../lib/api/shipment.api";
import { ShipmentCard } from "../../../components/shipment/shipment-card";
import { ShipmentCardSkeleton } from "../../../components/skeletons";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { EmptyMarketplace } from "../../../components/ui/empty-state";
import { toast } from "sonner";
import type { QueryShipmentParams } from "../../../types/shipment.types";

const CARGO_CATEGORIES = [
  "All",
  "Electronics",
  "Furniture",
  "Food & Beverage",
  "Clothing",
  "Machinery",
  "Chemicals",
  "Automotive",
  "Medical",
  "Other",
];

type SortOption = "price_asc" | "price_desc" | "date_asc" | "date_desc";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" },
];

export default function MarketplacePage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cargoCategory, setCargoCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("date_desc");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<QueryShipmentParams>({
    page: 1,
    limit: 12,
  });

  const {
    data: result,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["marketplace", filters],
    queryFn: () => shipmentApi.marketplace({ ...filters, page: filters.page }),
  });

  useEffect(() => {
    if (error) toast.error("Failed to load marketplace");
  }, [error]);

  const applyFilters = useCallback(
    (pg = 1) => {
      setPage(pg);
      setFilters({
        origin: origin || undefined,
        destination: destination || undefined,
        page: pg,
        limit: 12,
        cargoCategory: cargoCategory !== "All" ? cargoCategory : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
    },
    [origin, destination, cargoCategory, minPrice, maxPrice],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(1);
  };

  const handleClear = () => {
    setOrigin("");
    setDestination("");
    setCargoCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSort("date_desc");
    setPage(1);
    setFilters({ page: 1, limit: 12 });
  };

  // Client-side sort (API may not support all sort params)
  const sorted = result?.data
    ? [...result.data].sort((a, b) => {
        if (sort === "price_asc") return Number(a.price) - Number(b.price);
        if (sort === "price_desc") return Number(b.price) - Number(a.price);
        if (sort === "date_asc")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
    : [];

  const hasFilters =
    origin || destination || cargoCategory !== "All" || minPrice || maxPrice;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse available shipments open for carriers to accept.
        </p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-36"
          />
          <Input
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-36"
          />
          <select
            value={cargoCategory}
            onChange={(e) => setCargoCategory(e.target.value)}
            className="text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground"
          >
            {CARGO_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-28"
            min={0}
          />
          <Input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-28"
            min={0}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShipmentCardSkeleton key={i} />
          ))}
        </div>
      ) : !result || sorted.length === 0 ? (
        <EmptyMarketplace />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((s) => (
              <ShipmentCard key={s.id} shipment={s} />
            ))}
          </div>

          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => applyFilters(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {result.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === result.totalPages}
                onClick={() => applyFilters(page + 1)}
              >
                Next
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-3">
            {result.total} shipment{result.total !== 1 ? "s" : ""} available
          </p>
        </>
      )}
    </div>
  );
}
