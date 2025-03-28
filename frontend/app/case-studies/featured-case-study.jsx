"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Calendar, Star } from "lucide-react";

export default function FeaturedCaseStudy({ caseStudy, onSelect }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!caseStudy) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary text-white">
                Featured Case Study
              </Badge>
              <Badge variant="outline">{caseStudy.industry}</Badge>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {caseStudy.title}
            </h2>
            <p className="text-lg text-subText mb-4">{caseStudy.subtitle}</p>

            <div className="flex items-center gap-3 mb-6">
              <Avatar>
                <AvatarImage src={caseStudy.logo} alt={caseStudy.client} />
                <AvatarFallback>{caseStudy.client.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{caseStudy.client}</div>
                <div className="text-sm text-subText">{caseStudy.location}</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {caseStudy.results.slice(0, 2).map((result, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-xl">{result.value}</div>
                    <div className="text-sm text-subText">{result.metric}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-subText">
              <Calendar className="h-4 w-4" />
              <span>Published {formatDate(caseStudy.publishDate)}</span>
            </div>

            <Button onClick={() => onSelect(caseStudy)}>
              Read Case Study <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative h-full min-h-[300px]">
          <img
            src={caseStudy.heroImage || "/placeholder.svg"}
            alt={caseStudy.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
