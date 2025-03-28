"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react";

export default function CaseStudiesList({ caseStudies, onSelect }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(caseStudies.length / itemsPerPage);

  const paginatedCaseStudies = caseStudies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (caseStudies.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No case studies found</h3>
        <p className="text-subText mb-4">
          Try adjusting your filters or search criteria
        </p>
        <Button variant="outline">Clear Filters</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCaseStudies.map((caseStudy) => (
          <Card
            key={caseStudy.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelect(caseStudy)}
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={caseStudy.thumbnailImage || "/placeholder.svg"}
                alt={caseStudy.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
              {caseStudy.featured && (
                <Badge className="absolute top-2 right-2 bg-primary text-white">
                  Featured
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={caseStudy.logo} alt={caseStudy.client} />
                  <AvatarFallback>{caseStudy.client.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{caseStudy.client}</span>
              </div>

              <h3 className="font-bold text-lg mb-1 line-clamp-2">
                {caseStudy.title}
              </h3>
              <p className="text-sm text-subText mb-3 line-clamp-2">
                {caseStudy.subtitle}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">{caseStudy.industry}</Badge>
                {caseStudy.tags.slice(0, 1).map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-subText">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(caseStudy.publishDate)}</span>
                </div>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  Read More <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {caseStudies.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-subText">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, caseStudies.length)}
            </span>{" "}
            of <span className="font-medium">{caseStudies.length}</span> case
            studies
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
