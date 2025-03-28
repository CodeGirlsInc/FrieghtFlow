"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Filter, Download, HelpCircle } from "lucide-react";

export default function CaseStudiesHeader({ onSearch, caseStudyCount }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-headerText">
                  Customer Success Stories
                </h1>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-subText" />
                  <span className="font-medium">
                    {caseStudyCount} Case Studies
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    Proven results across industries
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
                <Input
                  type="search"
                  placeholder="Search case studies..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>

                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Real Results for Real Businesses
        </h2>
        <p className="text-lg text-subText">
          Discover how FreightFlow has helped companies across industries
          optimize their logistics operations, reduce costs, and improve
          customer satisfaction.
        </p>
      </div>
    </div>
  );
}
