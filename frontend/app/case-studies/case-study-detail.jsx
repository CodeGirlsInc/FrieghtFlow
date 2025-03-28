"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Download,
  MapPin,
  Share2,
  Star,
  Building,
  PieChart,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

export default function CaseStudyDetail({ caseStudy, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">Case Study</h2>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div>
        <div className="aspect-[21/9] relative rounded-lg overflow-hidden mb-6">
          <img
            src={caseStudy.heroImage || "/placeholder.svg"}
            alt={caseStudy.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={caseStudy.logo} alt={caseStudy.client} />
            <AvatarFallback>{caseStudy.client.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-lg">{caseStudy.client}</div>
            <div className="flex items-center gap-2 text-sm text-subText">
              <Building className="h-3 w-3" />
              <span>{caseStudy.industry}</span>
              <span>•</span>
              <MapPin className="h-3 w-3" />
              <span>{caseStudy.location}</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {caseStudy.title}
        </h1>
        <p className="text-lg text-subText mb-4">{caseStudy.subtitle}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {caseStudy.tags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-subText mb-6">
          <Calendar className="h-4 w-4" />
          <span>Published {formatDate(caseStudy.publishDate)}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Results & ROI</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-red-500" />
                  <h3 className="font-bold text-lg">The Challenge</h3>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-line">{caseStudy.challenge}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-bold text-lg">The Solution</h3>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-line">{caseStudy.solution}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-bold text-lg">Key Results</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {caseStudy.results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-muted p-4 rounded-md text-center"
                  >
                    <div className="font-bold text-2xl text-primary mb-2">
                      {result.value}
                    </div>
                    <div className="font-medium mb-1">{result.metric}</div>
                    <div className="text-sm text-subText">
                      {result.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="bg-primary/5 p-6 rounded-lg">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-shrink-0">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={caseStudy.testimonial.image}
                      alt={caseStudy.testimonial.author}
                    />
                    <AvatarFallback>
                      {caseStudy.testimonial.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <blockquote className="text-lg italic mb-3">
                    "{caseStudy.testimonial.quote}"
                  </blockquote>
                  <div className="font-medium">
                    {caseStudy.testimonial.author}
                  </div>
                  <div className="text-sm text-subText">
                    {caseStudy.testimonial.title},{" "}
                    {caseStudy.testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-4">Business Impact</h3>
                <div className="space-y-6">
                  {caseStudy.results.map((result, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-2xl">
                            {result.value}
                          </span>
                          <span className="font-medium">{result.metric}</span>
                        </div>
                        <p className="text-subText">{result.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Technologies Used</h3>
                <div className="grid grid-cols-2 gap-3">
                  {caseStudy.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-muted rounded-md"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="font-bold text-lg mb-4">
                    Customer Testimonial
                  </h3>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <blockquote className="text-lg italic mb-3">
                      "{caseStudy.testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={caseStudy.testimonial.image}
                          alt={caseStudy.testimonial.author}
                        />
                        <AvatarFallback>
                          {caseStudy.testimonial.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {caseStudy.testimonial.author}
                        </div>
                        <div className="text-sm text-subText">
                          {caseStudy.testimonial.title},{" "}
                          {caseStudy.testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="implementation">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-4">Implementation Process</h3>
              <div className="bg-muted p-4 rounded-md">
                <p className="whitespace-pre-line">
                  {caseStudy.implementation}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">
                Technologies Implemented
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseStudy.technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 border rounded-md"
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{tech}</div>
                      <div className="text-sm text-subText">
                        Successfully implemented
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <div className="flex gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    Implementation Insights
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This implementation was completed on time and within budget,
                    with minimal disruption to the client's ongoing operations.
                    The phased approach allowed for quick wins while building
                    toward the complete solution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
