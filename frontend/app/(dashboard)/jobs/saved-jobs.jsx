"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bookmark,
  Calendar,
  MapPin,
  MoreHorizontal,
  Truck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SavedJobs({
  jobs,
  onSelectJob,
  onSaveJob,
  showFull = false,
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Saved Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bookmark className="h-6 w-6 text-subText" />
            </div>
            <h3 className="font-medium mb-2">No saved jobs yet</h3>
            <p className="text-sm text-subText mb-4">
              Save jobs you're interested in to view them later
            </p>
            <Button variant="outline" size="sm">
              Browse Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showFull) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Saved Jobs</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-start gap-3 p-3 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => onSelectJob(job)}
              >
                <Avatar className="mt-1">
                  <AvatarImage src={job.company.logo} alt={job.company.name} />
                  <AvatarFallback>{job.company.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{job.title}</div>
                  <div className="text-sm text-subText">{job.company.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <MapPin className="h-3 w-3 text-subText" />
                    <span className="truncate">
                      {job.locations.pickup.address}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 text-xs text-subText">
                      <Calendar className="h-3 w-3" />
                      <span>Starts {formatDate(job.startDate)}</span>
                    </div>
                    <span className="font-medium text-sm">
                      {formatCurrency(job.compensation.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Saved Jobs ({jobs.length})</h3>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="mt-1">
                  <AvatarImage src={job.company.logo} alt={job.company.name} />
                  <AvatarFallback>{job.company.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{job.title}</div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveJob(job.id);
                        }}
                      >
                        <Bookmark className="h-4 w-4 text-primary" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSelectJob(job)}>
                            <Truck className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="text-sm text-subText">{job.company.name}</div>

                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-red-500" />
                      <span className="truncate">
                        {job.locations.pickup.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-green-500" />
                      <span className="truncate">
                        {job.locations.delivery.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-subText">
                      <Calendar className="h-3 w-3" />
                      <span>Starts {formatDate(job.startDate)}</span>
                    </div>
                    <span className="font-bold">
                      {formatCurrency(job.compensation.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
