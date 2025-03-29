import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  Search,
  Wifi,
} from "lucide-react";

export default function JobListings({
  jobs,
  departments,
  locations,
  selectedDepartment,
  selectedLocation,
  searchQuery,
  onDepartmentChange,
  onLocationChange,
  onSearchChange,
  onJobSelect,
  onApplyToJob,
  selectedJobId,
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return "Competitive";

    const formatNumber = (num) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}k`;
      }
      return num;
    };

    const min = formatNumber(salary.min);
    const max = formatNumber(salary.max);

    return `$${min}${max ? ` - $${max}` : "+"}${
      salary.commission ? " + Commission" : ""
    }`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search jobs by title, department, or location..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card
              key={job.id}
              className={`cursor-pointer transition-all ${
                selectedJobId === job.id
                  ? "border-primary"
                  : "hover:border-muted-foreground"
              }`}
              onClick={() => onJobSelect(job)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                    </div>
                    <Badge variant={job.remote ? "default" : "outline"}>
                      {job.remote ? (
                        <>
                          <Wifi className="mr-1 h-3 w-3" /> Remote
                        </>
                      ) : (
                        "On-site"
                      )}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatSalary(job.salary)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Posted {formatDate(job.postedDate)}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {job.description}
                  </p>

                  <div className="mt-auto flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobSelect(job);
                      }}
                    >
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyToJob(job);
                      }}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or check back later for new
              opportunities.
            </p>
            <Button
              onClick={() => {
                onDepartmentChange("all");
                onLocationChange("all");
                onSearchChange("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {selectedJobId && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs
              .filter((job) => job.id === selectedJobId)
              .map((job) => (
                <div key={job.id} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">{job.title}</h2>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <Badge variant="outline">
                        <Briefcase className="mr-1 h-3 w-3" /> {job.department}
                      </Badge>
                      <Badge variant="outline">
                        <MapPin className="mr-1 h-3 w-3" /> {job.location}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="mr-1 h-3 w-3" /> {job.type}
                      </Badge>
                      {job.remote && (
                        <Badge>
                          <Wifi className="mr-1 h-3 w-3" /> Remote
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      About the Role
                    </h3>
                    <p className="text-muted-foreground">{job.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                              <ChevronRight className="h-3 w-3 text-primary" />
                            </div>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Responsibilities
                      </h3>
                      <ul className="space-y-2">
                        {job.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                              <ChevronRight className="h-3 w-3 text-primary" />
                            </div>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => onApplyToJob(job)}>
                      Apply for this Position
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
