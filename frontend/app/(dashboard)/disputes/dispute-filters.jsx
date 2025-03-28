"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import { CalendarIcon, Check, Filter, X } from "lucide-react";
import { format } from "date-fns";

export default function DisputeFilters({ activeFilters, onFilterChange }) {
  const [filters, setFilters] = useState(activeFilters);
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "pending", label: "Pending" },
    { value: "resolved", label: "Resolved" },
  ];

  const typeOptions = [
    { value: "damage", label: "Damage" },
    { value: "billing", label: "Billing" },
    { value: "delay", label: "Delay" },
    { value: "missing", label: "Missing Items" },
    { value: "routing", label: "Routing" },
  ];

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const handleFilterChange = (filterType, value) => {
    let updatedFilters;

    if (
      filterType === "status" ||
      filterType === "type" ||
      filterType === "priority"
    ) {
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
    } else if (filterType === "dateRange") {
      updatedFilters = {
        ...filters,
        dateRange: value,
      };
      setDateRange(value);
    }

    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: [],
      type: [],
      priority: [],
      dateRange: null,
    };
    setFilters(clearedFilters);
    setDateRange({ from: null, to: null });
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.status.length > 0 ||
      filters.type.length > 0 ||
      filters.priority.length > 0 ||
      filters.dateRange !== null
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.status.length;
    count += filters.type.length;
    count += filters.priority.length;
    count += filters.dateRange ? 1 : 0;
    return count;
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
        defaultValue={["status", "type", "priority", "date"]}
      >
        <AccordionItem value="status">
          <AccordionTrigger>Status</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
                  onClick={() => handleFilterChange("status", option.value)}
                >
                  <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                    {filters.status.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type">
          <AccordionTrigger>Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {typeOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
                  onClick={() => handleFilterChange("type", option.value)}
                >
                  <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                    {filters.type.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="priority">
          <AccordionTrigger>Priority</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {priorityOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
                  onClick={() => handleFilterChange("priority", option.value)}
                >
                  <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                    {filters.priority.includes(option.value) && (
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
      </Accordion>

      <Separator />

      <div className="space-y-2">
        <h3 className="font-medium text-sm">Active Filters</h3>

        {hasActiveFilters() ? (
          <div className="flex flex-wrap gap-2">
            {filters.status.map((status) => {
              const option = statusOptions.find((opt) => opt.value === status);
              return (
                <Badge
                  key={status}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {option?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("status", status)}
                  />
                </Badge>
              );
            })}

            {filters.type.map((type) => {
              const option = typeOptions.find((opt) => opt.value === type);
              return (
                <Badge
                  key={type}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {option?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("type", type)}
                  />
                </Badge>
              );
            })}

            {filters.priority.map((priority) => {
              const option = priorityOptions.find(
                (opt) => opt.value === priority
              );
              return (
                <Badge
                  key={priority}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {option?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("priority", priority)}
                  />
                </Badge>
              );
            })}

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
          </div>
        ) : (
          <div className="text-sm text-subText">No active filters</div>
        )}
      </div>
    </div>
  );
}
