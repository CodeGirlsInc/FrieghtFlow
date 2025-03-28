"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";

export default function RelatedCaseStudies({ caseStudies, onSelect }) {
  if (!caseStudies || caseStudies.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Related Case Studies</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {caseStudies.map((caseStudy) => (
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

              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(caseStudy);
                }}
              >
                Read More <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
