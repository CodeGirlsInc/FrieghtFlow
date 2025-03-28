"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Filter,
  HelpCircle,
  MapPin,
  Search,
  Settings,
  Star,
  Truck,
  MapIcon,
  List,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function JobsHeader({
  onSearch,
  onToggleMapView,
  isMapView,
  jobCount,
  userStats,
}) {
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
                Available Jobs
              </h1>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-subText" />
                <span className="font-medium">{jobCount} Jobs Available</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-subText" />
                <span className="font-medium">Nationwide</span>
              </div>

              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">
                  Your Rating: {userStats.averageRating}/5
                </span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Top Performer
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-4">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-subText" />
              <Input
                type="search"
                placeholder="Search jobs, companies, locations..."
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

              <Button variant="outline" onClick={onToggleMapView}>
                {isMapView ? (
                  <>
                    <List className="mr-2 h-4 w-4" />
                    List View
                  </>
                ) : (
                  <>
                    <MapIcon className="mr-2 h-4 w-4" />
                    Map View
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Job Alerts</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
