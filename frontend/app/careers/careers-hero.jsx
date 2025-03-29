import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Globe, Star } from "lucide-react";

export default function CareersHero() {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-10"></div>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/placeholder.svg?height=600&width=1200')",
        }}
      ></div>

      <div className="relative z-20 px-6 py-16 md:py-24 md:px-12 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            We're on a mission to transform the freight industry. Join us and
            help build the future of logistics.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              View Open Positions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10"
            >
              Learn About Our Culture
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center justify-center mb-3">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">500+ Employees</h3>
              <p className="text-white/80">
                Across 12 global offices and remote locations
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center justify-center mb-3">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Impact</h3>
              <p className="text-white/80">
                Serving customers in over 50 countries worldwide
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center justify-center mb-3">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4.8/5 Rating</h3>
              <p className="text-white/80">
                Consistently rated as a top place to work
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
