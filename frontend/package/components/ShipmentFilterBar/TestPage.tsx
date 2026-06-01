/**
 * Test Page for ShipmentFilterBar
 *
 * This page demonstrates the ShipmentFilterBar component in action.
 * Navigate to /test/shipment-filter to see it working.
 */

"use client";

import { useState, useEffect } from "react";
import { ShipmentFilterBar, ShipmentFilters } from "./";

export default function ShipmentFilterTestPage() {
  const [currentFilters, setCurrentFilters] = useState<ShipmentFilters>({});
  const [filterHistory, setFilterHistory] = useState<ShipmentFilters[]>([]);

  const handleFilterChange = (filters: ShipmentFilters) => {
    setCurrentFilters(filters);
    setFilterHistory((prev) => [...prev, filters]);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ShipmentFilterBar Test Page
        </h1>
        <p className="text-muted-foreground">
          Test the multi-dimensional filtering component with URL-based state
          management
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">Filter Bar</h2>
        <ShipmentFilterBar onFilterChange={handleFilterChange} />
      </div>

      {/* Current Filters Display */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">Current Filters</h2>
        <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
          {JSON.stringify(currentFilters, null, 2)}
        </pre>
      </div>

      {/* URL Display */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">Current URL</h2>
        <p className="text-sm font-mono bg-muted p-4 rounded-md break-all">
          {typeof window !== "undefined" ? window.location.href : "Loading..."}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Copy this URL and paste it in a new tab to test filter persistence
        </p>
      </div>

      {/* Filter History */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">
          Filter History (Last {filterHistory.length} changes)
        </h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filterHistory.slice(-10).map((filters, index) => (
            <div
              key={index}
              className="p-3 bg-muted rounded-md text-sm font-mono"
            >
              {JSON.stringify(filters)}
            </div>
          ))}
          {filterHistory.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No filter changes yet. Try adjusting the filters above.
            </p>
          )}
        </div>
      </div>

      {/* Acceptance Criteria Checklist */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">
          Acceptance Criteria Checklist
        </h2>
        <div className="space-y-3">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">Text search input</span>
              <p className="text-sm text-muted-foreground">
                Matches tracking number, origin, destination, cargo description
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">Status multi-select</span>
              <p className="text-sm text-muted-foreground">
                Select one or more shipment statuses
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">Date range picker</span>
              <p className="text-sm text-muted-foreground">
                Filter by from/to dates
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">Origin country select</span>
              <p className="text-sm text-muted-foreground">
                Filter by origin country
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">URL query params</span>
              <p className="text-sm text-muted-foreground">
                Filters reflected in URL (e.g.,
                ?status=PENDING,IN_TRANSIT&search=LOS)
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">Debounced 400ms</span>
              <p className="text-sm text-muted-foreground">
                Text input debounced to prevent excessive updates
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">
                URL reflects all active filters
              </span>
              <p className="text-sm text-muted-foreground">
                Filtered view can be shared as a link
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">Clear All Filters button</span>
              <p className="text-sm text-muted-foreground">
                Resets all inputs and removes query params
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">Active filter count badge</span>
              <p className="text-sm text-muted-foreground">
                Shows how many filters are currently applied
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div>
              <span className="font-medium">No full page reload</span>
              <p className="text-sm text-muted-foreground">
                Shipment list updates without full page reload when filters
                change
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Type in the search box and watch the URL update after 400ms</li>
          <li>Click the Status button and select multiple statuses</li>
          <li>Select a date range using the date pickers</li>
          <li>Choose an origin country from the dropdown</li>
          <li>Observe the active filter count badge</li>
          <li>
            Copy the URL and open it in a new tab to verify filters persist
          </li>
          <li>Click "Clear All" to reset all filters</li>
          <li>
            Try removing individual filters by clicking the X on filter tags
          </li>
          <li>Use browser back/forward buttons to navigate filter history</li>
          <li>Check the console for any errors</li>
        </ol>
      </div>
    </div>
  );
}
