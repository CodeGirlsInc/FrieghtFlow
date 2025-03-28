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
import { Check, Filter, X } from "lucide-react";

export default function CaseStudyFilters({
  activeFilters,
  onFilterChange,
  industries,
  solutionTypes,
}) {
  const [filters, setFilters] = useState(activeFilters);

  const handleFilterChange = (filterType, value) => {
    let updatedFilters;

    if (filterType === "industry" || filterType === "solutionType") {
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
    }

    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      industry: [],
      solutionType: [],
      searchQuery: filters.searchQuery, // Preserve search query
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return filters.industry.length > 0 || filters.solutionType.length > 0;
  };

  const getActiveFilterCount = () => {
    return filters.industry.length + filters.solutionType.length;
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

      <Accordion type="multiple" defaultValue={["industry", "solutionType"]}>
        <AccordionItem value="industry">
          <AccordionTrigger>Industry</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {industries.map((industry) => (
                <div
                  key={industry}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
                  onClick={() => handleFilterChange("industry", industry)}
                >
                  <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                    {filters.industry.includes(industry) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span>{industry}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="solutionType">
          <AccordionTrigger>Solution Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {solutionTypes.map((solution) => (
                <div
                  key={solution}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
                  onClick={() => handleFilterChange("solutionType", solution)}
                >
                  <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                    {filters.solutionType.includes(solution) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span>{solution}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <div className="space-y-2">
        <h3 className="font-medium text-sm">Active Filters</h3>

        {hasActiveFilters() ? (
          <div className="flex flex-wrap gap-2">
            {filters.industry.map((industry) => (
              <Badge
                key={industry}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {industry}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange("industry", industry)}
                />
              </Badge>
            ))}

            {filters.solutionType.map((solution) => (
              <Badge
                key={solution}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {solution}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange("solutionType", solution)}
                />
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-sm text-subText">No active filters</div>
        )}
      </div>
    </div>
  );
}
