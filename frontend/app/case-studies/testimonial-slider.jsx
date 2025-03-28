"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestimonialSlider({ testimonials }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance the slider every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  if (!testimonials || testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold mb-6 text-center">
        What Our Customers Say
      </h2>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 order-2 md:order-1">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={currentTestimonial.image}
                  alt={currentTestimonial.author}
                />
                <AvatarFallback>
                  {currentTestimonial.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 order-1 md:order-2">
              <div className="mb-4">
                <Quote className="h-8 w-8 text-primary/40" />
              </div>

              <blockquote className="text-xl italic mb-4">
                "{currentTestimonial.quote}"
              </blockquote>

              <div className="font-bold">{currentTestimonial.author}</div>
              <div className="text-subText">
                {currentTestimonial.title}, {currentTestimonial.company}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-4 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {testimonials.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
