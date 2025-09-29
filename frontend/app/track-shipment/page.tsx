"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "current" | "pending";
  location?: string;
}

interface ShipmentData {
  trackingId: string;
  status: "in-transit" | "out-for-delivery" | "delivered";
  estimatedDelivery: string;
  currentLocation: string;
  steps: TrackingStep[];
}

// Mock data for demonstration
const mockShipmentData: ShipmentData = {
  trackingId: "TRK123456789",
  status: "out-for-delivery",
  estimatedDelivery: "Today by 6:00 PM",
  currentLocation: "Local Distribution Center",
  steps: [
    {
      id: "1",
      title: "Order Placed",
      description: "Your order has been confirmed and is being prepared",
      timestamp: "Dec 10, 2024 at 2:30 PM",
      status: "completed",
      location: "Warehouse - New York",
    },
    {
      id: "2",
      title: "In Transit",
      description: "Package is on its way to the destination",
      timestamp: "Dec 11, 2024 at 8:15 AM",
      status: "completed",
      location: "Distribution Center - Chicago",
    },
    {
      id: "3",
      title: "Out for Delivery",
      description: "Package is out for delivery and will arrive soon",
      timestamp: "Dec 12, 2024 at 9:00 AM",
      status: "current",
      location: "Local Distribution Center",
    },
    {
      id: "4",
      title: "Delivered",
      description: "Package has been successfully delivered",
      timestamp: "Expected today by 6:00 PM",
      status: "pending",
    },
  ],
};

export default function TrackShipmentPage() {
  const [trackingId, setTrackingId] = useState("");
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      if (trackingId.toLowerCase().includes("trk")) {
        setShipmentData(mockShipmentData);
      } else {
        setError("Tracking ID not found. Please check and try again.");
        setShipmentData(null);
      }
      setIsLoading(false);
    }, 1000);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-primary text-primary-foreground";
      case "out-for-delivery":
        return "bg-secondary text-secondary-foreground";
      case "in-transit":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStepIcon = (status: "completed" | "current" | "pending") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case "current":
        return <Clock className="h-5 w-5 text-secondary" />;
      default:
        return (
          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                ShipTracker
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tracking Input Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-balance">
                Track Your Shipment
              </CardTitle>
              <CardDescription className="text-lg">
                Enter your tracking ID to get real-time updates on your package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tracking ID (e.g., TRK123456789)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                  className="flex-1"
                />
                <Button
                  onClick={handleTrack}
                  disabled={isLoading}
                  className="px-6"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Shipment Results */}
        {shipmentData && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Tracking ID: {shipmentData.trackingId}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4" />
                      Current Location: {shipmentData.currentLocation}
                    </CardDescription>
                  </div>
                  <Badge
                    className={getStatusColor(shipmentData.status)}
                    variant="secondary"
                  >
                    {shipmentData.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Truck className="h-5 w-5 text-primary" />
                  Estimated Delivery: {shipmentData.estimatedDelivery}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Timeline</CardTitle>
                <CardDescription>
                  Track your package journey from start to finish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {shipmentData.steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {/* Timeline line */}
                      {index < shipmentData.steps.length - 1 && (
                        <div
                          className={`absolute left-[10px] top-8 w-0.5 h-16 ${
                            step.status === "completed"
                              ? "bg-primary"
                              : "bg-border"
                          }`}
                        />
                      )}

                      {/* Step content */}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStepIcon(step.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3
                              className={`font-semibold ${
                                step.status === "current"
                                  ? "text-secondary"
                                  : step.status === "completed"
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step.title}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {step.timestamp}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {step.description}
                          </p>
                          {step.location && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {step.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                © 2024 ShipTracker. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
