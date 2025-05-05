"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Check, Filter, MapPin, X } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export default function JobFilters({ activeFilters, onFilterChange }) {
  const [filters, setFilters] = useState(activeFilters);
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });
  const [locationSearch, setLocationSearch] = useState("");

  const jobTypeOptions = [
    { value: "local", label: "Local" },
    { value: "regional", label: "Regional" },
    { value: "long-haul", label: "Long Haul" },
    { value: "expedited", label: "Expedited" },
    { value: "specialized", label: "Specialized" },
    { value: "drayage", label: "Drayage" },
  ];

  const equipmentOptions = [
    { value: "van", label: "Dry Van" },
    { value: "refrigerated", label: "Refrigerated" },
    { value: "flatbed", label: "Flatbed" },
    { value: "tanker", label: "Tanker" },
    { value: "box truck", label: "Box Truck" },
    { value: "moving truck", label: "Moving Truck" },
    { value: "day cab", label: "Day Cab" },
  ];

  const handleFilterChange = (filterType, value) => {
    let updatedFilters;

    if (filterType === "jobType" || filterType === "equipment") {
      // Check if the value is already in the array
      if (filters[filterType].includes(value)) {
        // Remove it
        updatedFilters = {
          ...filters,
          [filterType]: filters[filterType].filter((item) => item !== value),
        };
      } else {
        // Add it
        updatedFilters = {
          ...filters,
          [filterType]: [...filters[filterType], value],
        };
      }
    } else if (filterType === "distance") {
      updatedFilters = {
        ...filters,
        distance: value,
      };
    } else if (filterType === "compensation") {
      updatedFilters = {
        ...filters,
        compensation: value,
      };
    } else if (filterType === "dateRange") {
      updatedFilters = {
        ...filters,
        dateRange: value,
      };
      setDateRange(value);
    } else if (filterType === "location") {
      updatedFilters = {
        ...filters,
        location: value,
      };
    }

    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      jobType: [],
      distance: null,
      compensation: { min: 0, max: null },
      equipment: [],
      dateRange: null,
      location: null,
    };
    setFilters(clearedFilters);
    setDateRange({ from: null, to: null });
    setLocationSearch("");
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.jobType.length > 0 ||
      filters.equipment.length > 0 ||
      filters.distance !== null ||
      filters.compensation.min > 0 ||
      filters.compensation.max !== null ||
      filters.dateRange !== null ||
      filters.location !== null
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.jobType.length;
    count += filters.equipment.length;
    count += filters.distance ? 1 : 0;
    count +=
      filters.compensation.min > 0 || filters.compensation.max !== null ? 1 : 0;
    count += filters.dateRange ? 1 : 0;
    count += filters.location ? 1 : 0;
    return count;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <Badge className="ml-2">{getActiveFilterCount()}</Badge>
          )}
        </div>

        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={[
          "jobType",
          "distance",
          "compensation",
          "equipment",
          "date",
          "location",
        ]}
      >
        <AccordionItem value="jobType">
          <AccordionTrigger>Job Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {jobTypeOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
                  onClick={() => handleFilterChange("jobType", option.value)}
                >
                  <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                    {filters.jobType.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="distance">
          <AccordionTrigger>Distance</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Maximum Distance</span>
                <span className="font-medium">
                  {filters.distance ? `${filters.distance} miles` : "Any"}
                </span>
              </div>

              <Slider
                defaultValue={[filters.distance || 1000]}
                max={3000}
                step={50}
                onValueChange={([value]) =>
                  handleFilterChange("distance", value)
                }
              />

              <div className="flex justify-between text-sm text-subText">
                <span>0 miles</span>
                <span>3,000+ miles</span>
              </div>

              <div className="flex gap-2 mt-2">
                {[100, 250, 500, 1000].map((value) => (
                  <Button
                    key={value}
                    variant={filters.distance === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange("distance", value)}
                  >
                    {value} mi
                  </Button>
                ))}
                <Button
                  variant={filters.distance === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("distance", null)}
                >
                  Any
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="compensation">
          <AccordionTrigger>Compensation</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Minimum Pay</span>
                <span className="font-medium">
                  {filters.compensation.min > 0
                    ? formatCurrency(filters.compensation.min)
                    : "Any"}
                </span>
              </div>

              <Slider
                defaultValue={[filters.compensation.min]}
                max={10000}
                step={100}
                onValueChange={([value]) =>
                  handleFilterChange("compensation", {
                    ...filters.compensation,
                    min: value,
                  })
                }
              />

              <div className="flex justify-between text-sm text-subText">
                <span>$0</span>
                <span>$10,000+</span>
              </div>

              <div className="flex gap-2 mt-2">
                {[500, 1000, 2500, 5000].map((value) => (
                  <Button
                    key={value}
                    variant={
                      filters.compensation.min === value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleFilterChange("compensation", {
                        ...filters.compensation,
                        min: value,
                      })
                    }
                  >
                    ${value}+
                  </Button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="equipment">
          <AccordionTrigger>Equipment</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {equipmentOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
                  onClick={() => handleFilterChange("equipment", option.value)}
                >
                  <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                    {filters.equipment.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="date">
          <AccordionTrigger>Date Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      handleFilterChange("dateRange", range);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {dateRange.from && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setDateRange({ from: null, to: null });
                    handleFilterChange("dateRange", null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Date Range
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger>Location</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
                <Input
                  placeholder="Enter city, state, or zip code"
                  className="pl-9"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (locationSearch) {
                      handleFilterChange("location", locationSearch);
                    }
                  }}
                  disabled={!locationSearch}
                >
                  Apply
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocationSearch("");
                    handleFilterChange("location", null);
                  }}
                  disabled={!filters.location}
                >
                  Clear
                </Button>
              </div>

              {filters.location && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{filters.location}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => {
                      setLocationSearch("");
                      handleFilterChange("location", null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <div className="space-y-2">
        <h3 className="font-medium text-sm">Active Filters</h3>

        {hasActiveFilters() ? (
          <div className="flex flex-wrap gap-2">
            {filters.jobType.map((type) => {
              const option = jobTypeOptions.find((opt) => opt.value === type);
              return (
                <Badge
                  key={type}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {option?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("jobType", type)}
                  />
                </Badge>
              );
            })}

            {filters.equipment.map((equip) => {
              const option = equipmentOptions.find(
                (opt) => opt.value === equip
              );
              return (
                <Badge
                  key={equip}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {option?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("equipment", equip)}
                  />
                </Badge>
              );
            })}

            {filters.distance && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Max {filters.distance} miles
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange("distance", null)}
                />
              </Badge>
            )}

            {filters.compensation.min > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Min {formatCurrency(filters.compensation.min)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    handleFilterChange("compensation", {
                      ...filters.compensation,
                      min: 0,
                    })
                  }
                />
              </Badge>
            )}

            {dateRange.from && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Date Range
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setDateRange({ from: null, to: null });
                    handleFilterChange("dateRange", null);
                  }}
                />
              </Badge>
            )}

            {filters.location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.location}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setLocationSearch("");
                    handleFilterChange("location", null);
                  }}
                />
              </Badge>
            )}
          </div>
        ) : (
          <div className="text-sm text-subText">No active filters</div>
        )}
      </div>
    </div>
  );
}
