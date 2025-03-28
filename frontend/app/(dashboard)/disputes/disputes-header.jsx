"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Clock,
  Download,
  Filter,
  HelpCircle,
  Plus,
  Search,
} from "lucide-react";

export default function DisputesHeader({ stats, onSearch, onCreateDispute }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-headerText">
                Disputes Management
              </h1>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  {stats.open} Open
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  {stats.pending} Pending
                </Badge>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {stats.resolved} Resolved
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium">
                  {stats.highPriority} High Priority
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-subText" />
                <span className="font-medium">Avg. Resolution Time:</span>
                <span>{stats.averageResolutionTime}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-4">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
              <Input
                type="search"
                placeholder="Search disputes..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>

              <Button onClick={onCreateDispute}>
                <Plus className="mr-2 h-4 w-4" />
                New Dispute
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
