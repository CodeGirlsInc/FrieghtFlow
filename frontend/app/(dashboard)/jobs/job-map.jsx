"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";

export default function JobMap({
  jobs,
  userLocation,
  onSelectJob,
  selectedJobId,
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [hoveredJobId, setHoveredJobId] = useState(null);

  // Initialize map when component mounts
  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    } else {
      initializeMap();
    }
  }, []);

  // Initialize the map
  const initializeMap = () => {
    if (!mapRef.current) return;

    const mapOptions = {
      center: userLocation || { lat: 39.8283, lng: -98.5795 }, // Center of US if no user location
      zoom: 4,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    };

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);

    const newInfoWindow = new window.google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);
  };

  // Update markers when jobs or map changes
  useEffect(() => {
    if (!map || !jobs.length) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    // Create new markers
    const newMarkers = jobs.map((job) => {
      // Create pickup marker
      const pickupMarker = new window.google.maps.Marker({
        position: job.locations.pickup.coordinates,
        map: map,
        title: job.title,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
            ),
          scaledSize: new window.google.maps.Size(24, 24),
        },
      });

      // Create delivery marker
      const deliveryMarker = new window.google.maps.Marker({
        position: job.locations.delivery.coordinates,
        map: map,
        title: job.title,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
            ),
          scaledSize: new window.google.maps.Size(24, 24),
        },
      });

      // Create route line
      const routeLine = new window.google.maps.Polyline({
        path: [
          job.locations.pickup.coordinates,
          job.locations.delivery.coordinates,
        ],
        geodesic: true,
        strokeColor: "#6366F1",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: map,
      });

      // Add click event to markers
      pickupMarker.addListener("click", () => {
        showInfoWindow(job, pickupMarker, "pickup");
        onSelectJob(job);
      });

      deliveryMarker.addListener("click", () => {
        showInfoWindow(job, deliveryMarker, "delivery");
        onSelectJob(job);
      });

      return { pickupMarker, deliveryMarker, routeLine, job };
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    const bounds = new window.google.maps.LatLngBounds();
    newMarkers.forEach((marker) => {
      bounds.extend(marker.pickupMarker.getPosition());
      bounds.extend(marker.deliveryMarker.getPosition());
    });
    map.fitBounds(bounds);

    // If user location is available, add a marker for it
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>`
            ),
          scaledSize: new window.google.maps.Size(24, 24),
        },
      });
    }
  }, [map, jobs]);

  // Update map when selected job changes
  useEffect(() => {
    if (!map || !infoWindow || !markers.length || !selectedJobId) return;

    const marker = markers.find((m) => m.job.id === selectedJobId);
    if (marker) {
      showInfoWindow(marker.job, marker.pickupMarker, "pickup");

      // Center map on the route
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(marker.pickupMarker.getPosition());
      bounds.extend(marker.deliveryMarker.getPosition());
      map.fitBounds(bounds);
    }
  }, [selectedJobId, map, infoWindow, markers]);

  const showInfoWindow = (job, marker, locationType) => {
    if (!infoWindow) return;

    const location =
      locationType === "pickup" ? job.locations.pickup : job.locations.delivery;

    const content = `
      <div style="max-width: 200px; padding: 5px;">
        <div style="font-weight: bold;">${job.title}</div>
        <div style="margin-top: 5px;">
          <strong>${
            locationType === "pickup" ? "Pickup" : "Delivery"
          }:</strong> ${location.address}
        </div>
        <div style="margin-top: 5px;">
          <strong>Pay:</strong> $${job.compensation.amount.toLocaleString()}
        </div>
      </div>
    `;

    infoWindow.setContent(content);
    infoWindow.open(map, marker);
    setSelectedMarker(marker);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Card className="h-[600px]">
          <div ref={mapRef} className="w-full h-full rounded-md" />
        </Card>
      </div>

      <div className="md:col-span-1 overflow-auto max-h-[600px]">
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={`cursor-pointer transition-all ${
                selectedJobId === job.id
                  ? "border-primary"
                  : hoveredJobId === job.id
                  ? "border-muted-foreground"
                  : ""
              }`}
              onClick={() => onSelectJob(job)}
              onMouseEnter={() => setHoveredJobId(job.id)}
              onMouseLeave={() => setHoveredJobId(null)}
            >
              <CardContent className="p-3">
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
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{job.title}</div>
                    <div className="text-sm text-subText">
                      {job.company.name}
                    </div>

                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500" />
                        <span className="truncate">
                          {job.locations.pickup.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-green-500" />
                        <span className="truncate">
                          {job.locations.delivery.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline">{job.distance} miles</Badge>
                      <span className="font-bold">
                        {formatCurrency(job.compensation.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
