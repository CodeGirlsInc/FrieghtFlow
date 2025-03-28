"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookmarkPlus, Calendar, MapPin, Percent, Star } from "lucide-react";

export default function RecommendedJobs({ jobs, onSelectJob, onSaveJob }) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Recommended For You</h3>
        <Button variant="link" size="sm" className="h-auto p-0">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <Card
            key={job.id}
            className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectJob(job)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="mt-1">
                  <AvatarImage src={job.company.logo} alt={job.company.name} />
                  <AvatarFallback>{job.company.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{job.title}</div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {job.matchScore}% Match
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-subText">
                    <span>{job.company.name}</span>
                    <span>•</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{job.company.rating}</span>
                    </div>
                  </div>

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

                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline">
                      {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveJob(job.id);
                      }}
                    >
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Save
                    </Button>
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
