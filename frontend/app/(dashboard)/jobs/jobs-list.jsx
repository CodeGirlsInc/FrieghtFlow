"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertCircle,
  BookmarkPlus,
  Bookmark,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
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

export default function JobsList({
  jobs,
  onSelectJob,
  onSaveJob,
  onApplyToJob,
  selectedJobId,
  showApplicationStatus = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  const paginatedJobs = jobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getJobTypeBadge = (type) => {
    switch (type) {
      case "long-haul":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Long Haul
          </Badge>
        );
      case "local":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Local
          </Badge>
        );
      case "regional":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Regional
          </Badge>
        );
      case "expedited":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Expedited
          </Badge>
        );
      case "specialized":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            Specialized
          </Badge>
        );
      case "drayage":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
            Drayage
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        );
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Critical
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

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

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Job</TableHead>
              <TableHead className="hidden md:table-cell">Route</TableHead>
              <TableHead className="hidden md:table-cell">Equipment</TableHead>
              <TableHead>Pay</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job) => (
                <TableRow
                  key={job.id}
                  className={`cursor-pointer ${
                    selectedJobId === job.id ? "bg-muted/50" : ""
                  }`}
                  onClick={() => onSelectJob(job)}
                >
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <Avatar className="mt-1">
                        <AvatarImage
                          src={job.company.logo}
                          alt={job.company.name}
                        />
                        <AvatarFallback>
                          {job.company.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-subText">
                          {job.company.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getJobTypeBadge(job.type)}
                          {job.urgency && getUrgencyBadge(job.urgency)}
                          {job.applied && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Applied
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-subText" />
                      <span>{job.locations.pickup.address}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4 text-subText" />
                      <span>{job.locations.delivery.address}</span>
                    </div>
                    <div className="text-sm text-subText mt-1">
                      {job.distance} miles
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Truck className="h-4 w-4 text-subText" />
                      <span>
                        {job.equipment.type.charAt(0).toUpperCase() +
                          job.equipment.type.slice(1)}
                        {job.equipment.size && ` (${job.equipment.size})`}
                      </span>
                    </div>
                    <div className="text-sm text-subText mt-1">
                      {job.cargo.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-lg">
                      {formatCurrency(job.compensation.amount)}
                    </div>
                    <div className="text-sm text-subText">
                      {job.compensation.type === "fixed"
                        ? "Fixed Rate"
                        : "Per Mile"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-subText" />
                      <span>{formatDate(job.startDate)}</span>
                    </div>
                    {job.deadline && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-subText">
                        <Clock className="h-3 w-3" />
                        <span>Apply by {formatDate(job.deadline)}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveJob(job.id);
                        }}
                      >
                        {job.saved ? (
                          <Bookmark className="h-4 w-4 text-primary" />
                        ) : (
                          <BookmarkPlus className="h-4 w-4" />
                        )}
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
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectJob(job);
                            }}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          {!job.applied && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onApplyToJob(job);
                              }}
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              <span>Apply Now</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No jobs found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {jobs.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-subText">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, jobs.length)}
            </span>{" "}
            of <span className="font-medium">{jobs.length}</span> jobs
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
