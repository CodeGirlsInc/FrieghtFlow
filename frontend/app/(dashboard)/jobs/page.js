"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import JobsHeader from "@/components/jobs/jobs-header";
import JobsList from "@/components/jobs/jobs-list";
import JobDetails from "@/components/jobs/job-details";
import JobFilters from "@/components/jobs/job-filters";
import JobMap from "@/components/jobs/job-map";
import JobApplication from "@/components/jobs/job-application";
import SavedJobs from "@/components/jobs/saved-jobs";
import RecommendedJobs from "@/components/jobs/recommended-jobs";
import JobStats from "@/components/jobs/job-stats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for jobs
const mockJobs = [
  {
    id: "job-1001",
    title: "Cross-Country Refrigerated Delivery",
    company: {
      id: "comp-101",
      name: "Fresh Foods Distribution",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      reviewCount: 124,
      verified: true,
    },
    type: "long-haul",
    status: "open",
    urgency: "high",
    datePosted: "2023-03-15T10:30:00Z",
    deadline: "2023-03-20T23:59:59Z",
    startDate: "2023-03-25T08:00:00Z",
    endDate: "2023-03-30T17:00:00Z",
    locations: {
      pickup: {
        address: "Miami, FL",
        coordinates: { lat: 25.7617, lng: -80.1918 },
      },
      delivery: {
        address: "Seattle, WA",
        coordinates: { lat: 47.6062, lng: -122.3321 },
      },
    },
    distance: 3300,
    equipment: {
      type: "refrigerated",
      size: "53ft",
      requirements: ["Temperature Control", "GPS Tracking"],
    },
    cargo: {
      type: "Perishable Food",
      weight: 22000,
      dimensions: "Full Trailer",
      hazardous: false,
      temperature: "34°F",
    },
    compensation: {
      amount: 6800,
      type: "fixed",
      currency: "USD",
      paymentTerms: "Net 15",
      fuelSurcharge: true,
      detention: "$50/hr after 2 hours",
    },
    requirements: {
      experience: 2,
      insurance: ["General Liability", "Cargo", "Auto"],
      certifications: ["CDL-A", "Food Handling"],
      equipment: ["Refrigerated Trailer", "GPS Tracking"],
    },
    description:
      "Looking for an experienced driver with refrigerated trailer to transport perishable food products from Miami to Seattle. Temperature control is critical. Cargo must be maintained at 34°F throughout transit. Pickup available starting March 25th with delivery window of March 28-30. Detention pay applies after 2 hours. Fuel surcharge included.",
    applicationCount: 8,
    viewCount: 45,
    saved: false,
    applied: false,
  },
  {
    id: "job-1002",
    title: "Local Furniture Delivery",
    company: {
      id: "comp-102",
      name: "Modern Home Furnishings",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.5,
      reviewCount: 89,
      verified: true,
    },
    type: "local",
    status: "open",
    urgency: "medium",
    datePosted: "2023-03-16T14:45:00Z",
    deadline: "2023-03-22T23:59:59Z",
    startDate: "2023-03-24T09:00:00Z",
    endDate: "2023-03-24T17:00:00Z",
    locations: {
      pickup: {
        address: "Chicago, IL - Warehouse District",
        coordinates: { lat: 41.8781, lng: -87.6298 },
      },
      delivery: {
        address: "Chicago Metropolitan Area",
        coordinates: { lat: 41.9, lng: -87.65 },
      },
    },
    distance: 50,
    equipment: {
      type: "box truck",
      size: "26ft",
      requirements: ["Lift Gate", "Furniture Pads"],
    },
    cargo: {
      type: "Furniture",
      weight: 5000,
      dimensions: "Various",
      hazardous: false,
    },
    compensation: {
      amount: 450,
      type: "fixed",
      currency: "USD",
      paymentTerms: "Net 7",
      fuelSurcharge: false,
      detention: "$30/hr after 1 hour",
    },
    requirements: {
      experience: 1,
      insurance: ["General Liability", "Cargo"],
      certifications: [],
      equipment: ["Box Truck", "Lift Gate", "Furniture Pads", "Dolly"],
    },
    description:
      "Need a box truck with lift gate for local furniture deliveries in the Chicago area. Multiple stops throughout the day. Must have furniture pads and dolly. Experience with furniture handling preferred. One-day job with possibility of recurring work for reliable carriers.",
    applicationCount: 12,
    viewCount: 67,
    saved: true,
    applied: false,
  },
  {
    id: "job-1003",
    title: "Hazardous Materials Transport",
    company: {
      id: "comp-103",
      name: "ChemSolutions Inc.",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
      reviewCount: 56,
      verified: true,
    },
    type: "specialized",
    status: "open",
    urgency: "high",
    datePosted: "2023-03-17T09:15:00Z",
    deadline: "2023-03-21T23:59:59Z",
    startDate: "2023-03-27T07:00:00Z",
    endDate: "2023-03-29T16:00:00Z",
    locations: {
      pickup: {
        address: "Houston, TX",
        coordinates: { lat: 29.7604, lng: -95.3698 },
      },
      delivery: {
        address: "Denver, CO",
        coordinates: { lat: 39.7392, lng: -104.9903 },
      },
    },
    distance: 1030,
    equipment: {
      type: "tanker",
      size: "40ft",
      requirements: ["Hazmat Certified", "Double Containment"],
    },
    cargo: {
      type: "Industrial Chemicals",
      weight: 18000,
      dimensions: "Liquid Bulk",
      hazardous: true,
      hazmatClass: "Class 3 - Flammable Liquids",
    },
    compensation: {
      amount: 5200,
      type: "fixed",
      currency: "USD",
      paymentTerms: "Net 10",
      fuelSurcharge: true,
      detention: "$75/hr after 2 hours",
    },
    requirements: {
      experience: 3,
      insurance: ["General Liability", "Cargo", "Auto", "Environmental"],
      certifications: ["CDL-A", "Hazmat Endorsement", "TWIC"],
      equipment: ["Tanker", "Hazmat Equipment"],
    },
    description:
      "Seeking qualified hazmat carrier to transport industrial chemicals from Houston to Denver. Must have all proper certifications and equipment for Class 3 Hazardous Materials. Tanker with double containment required. Premium pay reflects specialized nature of the load.",
    applicationCount: 4,
    viewCount: 38,
    saved: false,
    applied: true,
  },
  {
    id: "job-1004",
    title: "Expedited Medical Supplies Delivery",
    company: {
      id: "comp-104",
      name: "MedExpress Logistics",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      reviewCount: 112,
      verified: true,
    },
    type: "expedited",
    status: "open",
    urgency: "critical",
    datePosted: "2023-03-18T08:30:00Z",
    deadline: "2023-03-19T12:00:00Z",
    startDate: "2023-03-20T06:00:00Z",
    endDate: "2023-03-20T18:00:00Z",
    locations: {
      pickup: {
        address: "Boston, MA",
        coordinates: { lat: 42.3601, lng: -71.0589 },
      },
      delivery: {
        address: "Philadelphia, PA",
        coordinates: { lat: 39.9526, lng: -75.1652 },
      },
    },
    distance: 300,
    equipment: {
      type: "van",
      size: "Sprinter",
      requirements: ["Temperature Control", "Clean Interior"],
    },
    cargo: {
      type: "Medical Supplies",
      weight: 1200,
      dimensions: "Palletized",
      hazardous: false,
      temperature: "Room Temperature",
    },
    compensation: {
      amount: 950,
      type: "fixed",
      currency: "USD",
      paymentTerms: "Same Day",
      fuelSurcharge: true,
      detention: "$60/hr after 1 hour",
    },
    requirements: {
      experience: 1,
      insurance: ["General Liability", "Cargo", "Auto"],
      certifications: [],
      equipment: ["Sprinter Van", "Straps", "Blankets"],
    },
    description:
      "Urgent delivery of critical medical supplies needed from Boston to Philadelphia. Must be delivered same day. Cargo requires clean environment and careful handling. Premium pay for expedited service. Same-day payment upon successful delivery.",
    applicationCount: 15,
    viewCount: 89,
    saved: true,
    applied: false,
  },
  {
    id: "job-1005",
    title: "Heavy Machinery Transport",
    company: {
      id: "comp-105",
      name: "Construction Equipment Co.",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.6,
      reviewCount: 78,
      verified: true,
    },
    type: "specialized",
    status: "open",
    urgency: "medium",
    datePosted: "2023-03-16T11:20:00Z",
    deadline: "2023-03-23T23:59:59Z",
    startDate: "2023-03-27T08:00:00Z",
    endDate: "2023-03-31T17:00:00Z",
    locations: {
      pickup: {
        address: "Atlanta, GA",
        coordinates: { lat: 33.749, lng: -84.388 },
      },
      delivery: {
        address: "Nashville, TN",
        coordinates: { lat: 36.1627, lng: -86.7816 },
      },
    },
    distance: 250,
    equipment: {
      type: "flatbed",
      size: "48ft",
      requirements: ["Chains", "Straps", "Tarps"],
    },
    cargo: {
      type: "Excavator",
      weight: 35000,
      dimensions: "12ft x 8ft x 9ft",
      hazardous: false,
      oversized: true,
    },
    compensation: {
      amount: 2800,
      type: "fixed",
      currency: "USD",
      paymentTerms: "Net 15",
      fuelSurcharge: true,
      detention: "$65/hr after 2 hours",
    },
    requirements: {
      experience: 3,
      insurance: ["General Liability", "Cargo", "Auto"],
      certifications: ["CDL-A"],
      equipment: ["Flatbed", "Chains", "Straps", "Tarps"],
    },
    description:
      "Need experienced flatbed carrier to transport excavator from Atlanta to Nashville. Load is oversized and requires proper securement. Must have experience with heavy machinery transport. Permits will be provided by shipper.",
    applicationCount: 6,
    viewCount: 52,
    saved: false,
    applied: false,
  },
  {
    id: "job-1006",
    title: "Auto Parts Delivery Route",
    company: {
      id: "comp-106",
      name: "AutoZone Distribution",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.4,
      reviewCount: 95,
      verified: true,
    },
    type: "regional",
    status: "open",
    urgency: "medium",
    datePosted: "2023-03-17T13:45:00Z",
    deadline: "2023-03-24T23:59:59Z",
    startDate: "2023-03-26T05:00:00Z",
    endDate: "2023-03-26T17:00:00Z",
    locations: {
      pickup: {
        address: "Dallas, TX - Distribution Center",
        coordinates: { lat: 32.7767, lng: -96.797 },
      },
      delivery: {
        address: "Multiple locations in Texas",
        coordinates: { lat: 31.9686, lng: -99.9018 },
      },
    },
    distance: 300,
    equipment: {
      type: "box truck",
      size: "24ft",
      requirements: ["Lift Gate"],
    },
    cargo: {
      type: "Auto Parts",
      weight: 8000,
      dimensions: "Palletized",
      hazardous: false,
    },
    compensation: {
      amount: 650,
      type: "fixed",
      currency: "USD",
      paymentTerms: "Net 7",
      fuelSurcharge: true,
      detention: "$35/hr after 1 hour",
    },
    requirements: {
      experience: 1,
      insurance: ["General Liability", "Cargo", "Auto"],
      certifications: [],
      equipment: ["Box Truck", "Lift Gate", "Pallet Jack"],
    },
    description:
      "Daily route delivering auto parts to multiple AutoZone stores throughout Texas. Starts at Dallas distribution center with 5-7 stops. Must have lift gate and pallet jack. Potential for recurring work for reliable carriers.",
    applicationCount: 18,
    viewCount: 104,
    saved: false,
    applied: false,
  },
  {
    id: "job-1007",
    title: "Residential Moving Services",
    company: {
      id: "comp-107",
      name: "EasyMove Relocation",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
      reviewCount: 136,
      verified: true,
    },
    type: "local",
    status: "open",
    urgency: "medium",
    datePosted: "2023-03-18T09:30:00Z",
    deadline: "2023-03-25T23:59:59Z",
    startDate: "2023-03-28T08:00:00Z",
    endDate: "2023-03-28T17:00:00Z",
    locations: {
      pickup: {
        address: "San Francisco, CA",
        coordinates: { lat: 37.7749, lng: -122.4194 },
      },
      delivery: {
        address: "San Jose, CA",
        coordinates: { lat: 37.3382, lng: -121.8863 },
      },
    },
    distance: 50,
    equipment: {
      type: "moving truck",
      size: "26ft",
      requirements: ["Furniture Pads", "Dollies", "Ramps"],
    },
    cargo: {
      type: "Household Goods",
      weight: 6000,
      dimensions: "Full Truck",
      hazardous: false,
      fragile: true,
    },
    compensation: {
      amount: 750,
      type: "fixed",
      currency: "USD",
      paymentTerms: "Net 3",
      fuelSurcharge: false,
      detention: "$40/hr after 1 hour",
    },
    requirements: {
      experience: 1,
      insurance: ["General Liability", "Cargo", "Auto"],
      certifications: [],
      equipment: ["Moving Truck", "Furniture Pads", "Dollies", "Ramps"],
    },
    description:
      "Need experienced movers with proper equipment to handle residential move from San Francisco to San Jose. 3-bedroom house with standard furniture. Some items require special handling. Loading help will be provided at origin.",
    applicationCount: 10,
    viewCount: 72,
    saved: false,
    applied: false,
  },
  {
    id: "job-1008",
    title: "Intermodal Container Drayage",
    company: {
      id: "comp-108",
      name: "Pacific Intermodal",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.5,
      reviewCount: 83,
      verified: true,
    },
    type: "drayage",
    status: "open",
    urgency: "high",
    datePosted: "2023-03-17T15:20:00Z",
    deadline: "2023-03-22T23:59:59Z",
    startDate: "2023-03-24T06:00:00Z",
    endDate: "2023-03-24T16:00:00Z",
    locations: {
      pickup: {
        address: "Port of Los Angeles, CA",
        coordinates: { lat: 33.7395, lng: -118.261 },
      },
      delivery: {
        address: "Ontario, CA",
        coordinates: { lat: 34.0633, lng: -117.6509 },
      },
    },
    distance: 60,
    equipment: {
      type: "day cab",
      size: "Standard",
      requirements: ["Container Chassis"],
    },
    cargo: {
      type: "Imported Goods",
      weight: 42000,
      dimensions: "40ft Container",
      hazardous: false,
    },
    compensation: {
      amount: 380,
      type: "fixed",
      currency: "USD",
      paymentTerms: "Net 7",
      fuelSurcharge: true,
      detention: "$65/hr after 2 hours",
    },
    requirements: {
      experience: 2,
      insurance: ["General Liability", "Cargo", "Auto"],
      certifications: ["TWIC"],
      equipment: ["Day Cab", "Container Chassis"],
    },
    description:
      "Port drayage job moving 40ft container from Port of Los Angeles to warehouse in Ontario. Must have TWIC card and proper chassis. Potential for regular port work for reliable carriers.",
    applicationCount: 9,
    viewCount: 61,
    saved: false,
    applied: false,
  },
];

// Mock data for recommended jobs
const mockRecommendedJobs = [
  {
    id: "job-2001",
    title: "Refrigerated Produce Delivery",
    company: {
      id: "comp-201",
      name: "Organic Farms Distribution",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
      verified: true,
    },
    type: "regional",
    locations: {
      pickup: {
        address: "Sacramento, CA",
        coordinates: { lat: 38.5816, lng: -121.4944 },
      },
      delivery: {
        address: "Portland, OR",
        coordinates: { lat: 45.5051, lng: -122.675 },
      },
    },
    distance: 580,
    compensation: {
      amount: 1800,
      currency: "USD",
    },
    startDate: "2023-03-26T07:00:00Z",
    matchScore: 95,
  },
  {
    id: "job-2002",
    title: "Medical Equipment Transport",
    company: {
      id: "comp-202",
      name: "HealthTech Logistics",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      verified: true,
    },
    type: "expedited",
    locations: {
      pickup: {
        address: "Boston, MA",
        coordinates: { lat: 42.3601, lng: -71.0589 },
      },
      delivery: {
        address: "New York, NY",
        coordinates: { lat: 40.7128, lng: -74.006 },
      },
    },
    distance: 215,
    compensation: {
      amount: 850,
      currency: "USD",
    },
    startDate: "2023-03-25T08:00:00Z",
    matchScore: 92,
  },
  {
    id: "job-2003",
    title: "Retail Store Deliveries",
    company: {
      id: "comp-203",
      name: "Fashion Retailers Inc.",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.5,
      verified: true,
    },
    type: "local",
    locations: {
      pickup: {
        address: "Chicago, IL - Distribution Center",
        coordinates: { lat: 41.8781, lng: -87.6298 },
      },
      delivery: {
        address: "Chicago Metropolitan Area",
        coordinates: { lat: 41.9, lng: -87.65 },
      },
    },
    distance: 40,
    compensation: {
      amount: 400,
      currency: "USD",
    },
    startDate: "2023-03-27T09:00:00Z",
    matchScore: 88,
  },
];

// Mock data for saved jobs
const mockSavedJobs = [
  {
    id: "job-1002",
    title: "Local Furniture Delivery",
    company: {
      id: "comp-102",
      name: "Modern Home Furnishings",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.5,
      verified: true,
    },
    type: "local",
    locations: {
      pickup: {
        address: "Chicago, IL",
        coordinates: { lat: 41.8781, lng: -87.6298 },
      },
      delivery: {
        address: "Chicago Metropolitan Area",
        coordinates: { lat: 41.9, lng: -87.65 },
      },
    },
    compensation: {
      amount: 450,
      currency: "USD",
    },
    startDate: "2023-03-24T09:00:00Z",
    savedDate: "2023-03-17T10:15:00Z",
  },
  {
    id: "job-1004",
    title: "Expedited Medical Supplies Delivery",
    company: {
      id: "comp-104",
      name: "MedExpress Logistics",
      logo: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      verified: true,
    },
    type: "expedited",
    locations: {
      pickup: {
        address: "Boston, MA",
        coordinates: { lat: 42.3601, lng: -71.0589 },
      },
      delivery: {
        address: "Philadelphia, PA",
        coordinates: { lat: 39.9526, lng: -75.1652 },
      },
    },
    compensation: {
      amount: 950,
      currency: "USD",
    },
    startDate: "2023-03-20T06:00:00Z",
    savedDate: "2023-03-18T14:30:00Z",
  },
];

// Mock data for user stats
const mockUserStats = {
  jobsCompleted: 47,
  totalEarnings: 68450,
  averageRating: 4.8,
  reviewCount: 42,
  applicationSuccessRate: 76,
  preferredJobTypes: ["regional", "expedited"],
  topRoutes: [
    { from: "Chicago, IL", to: "Indianapolis, IN", count: 8 },
    { from: "New York, NY", to: "Boston, MA", count: 6 },
    { from: "Atlanta, GA", to: "Nashville, TN", count: 5 },
  ],
  recentEarnings: [
    { week: "Mar 5-11", amount: 3200 },
    { week: "Feb 26-Mar 4", amount: 2850 },
    { week: "Feb 19-25", amount: 3450 },
    { week: "Feb 12-18", amount: 2950 },
  ],
};

export default function JobsPage() {
  const [jobs, setJobs] = useState(mockJobs);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    jobType: [],
    distance: null,
    compensation: { min: 0, max: null },
    equipment: [],
    dateRange: null,
    location: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Get user location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a central US location if geolocation fails
          setUserLocation({ lat: 39.8283, lng: -98.5795 });
        }
      );
    }
  }, []);

  // Filter jobs based on active filters and search query
  const filteredJobs = jobs.filter((job) => {
    // Filter by job type
    if (
      activeFilters.jobType.length > 0 &&
      !activeFilters.jobType.includes(job.type)
    ) {
      return false;
    }

    // Filter by distance
    if (activeFilters.distance && job.distance > activeFilters.distance) {
      return false;
    }

    // Filter by compensation
    if (
      activeFilters.compensation.min > 0 &&
      job.compensation.amount < activeFilters.compensation.min
    ) {
      return false;
    }
    if (
      activeFilters.compensation.max &&
      job.compensation.amount > activeFilters.compensation.max
    ) {
      return false;
    }

    // Filter by equipment
    if (
      activeFilters.equipment.length > 0 &&
      !activeFilters.equipment.includes(job.equipment.type)
    ) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.locations.pickup.address.toLowerCase().includes(query) ||
        job.locations.delivery.address.toLowerCase().includes(query) ||
        job.cargo.type.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  const handleApplyToJob = (job) => {
    setSelectedJob(job);
    setIsApplicationOpen(true);
  };

  const handleSubmitApplication = (applicationData) => {
    // In a real app, this would make an API call
    console.log("Submitting application:", applicationData);

    // Update the job's applied status
    const updatedJobs = jobs.map((j) =>
      j.id === selectedJob.id
        ? { ...j, applied: true, applicationCount: j.applicationCount + 1 }
        : j
    );

    setJobs(updatedJobs);
    setIsApplicationOpen(false);

    // Update the selected job
    setSelectedJob({
      ...selectedJob,
      applied: true,
      applicationCount: selectedJob.applicationCount + 1,
    });
  };

  const handleSaveJob = (jobId) => {
    // Toggle saved status
    const updatedJobs = jobs.map((job) =>
      job.id === jobId ? { ...job, saved: !job.saved } : job
    );

    setJobs(updatedJobs);

    // Update selected job if it's the one being saved/unsaved
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob({ ...selectedJob, saved: !selectedJob.saved });
    }
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <JobsHeader
        onSearch={handleSearchChange}
        onToggleMapView={() => setIsMapView(!isMapView)}
        isMapView={isMapView}
        jobCount={filteredJobs.length}
        userStats={mockUserStats}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <JobFilters
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />

          <div className="mt-6">
            <JobStats stats={mockUserStats} />
          </div>

          <div className="mt-6">
            <SavedJobs
              jobs={mockSavedJobs}
              onSelectJob={handleJobSelect}
              onSaveJob={handleSaveJob}
            />
          </div>
        </div>

        <div className="md:col-span-3">
          {isMapView ? (
            <JobMap
              jobs={filteredJobs}
              userLocation={userLocation}
              onSelectJob={handleJobSelect}
              selectedJobId={selectedJob?.id}
            />
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="all">All Jobs</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
                <TabsTrigger value="applied">Applied</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Card>
                  <JobsList
                    jobs={filteredJobs}
                    onSelectJob={handleJobSelect}
                    onSaveJob={handleSaveJob}
                    onApplyToJob={handleApplyToJob}
                    selectedJobId={selectedJob?.id}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="recommended">
                <Card>
                  <RecommendedJobs
                    jobs={mockRecommendedJobs}
                    onSelectJob={handleJobSelect}
                    onSaveJob={handleSaveJob}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="saved">
                <Card>
                  <SavedJobs
                    jobs={mockSavedJobs.map((job) => {
                      const fullJob = jobs.find((j) => j.id === job.id);
                      return fullJob || job;
                    })}
                    onSelectJob={handleJobSelect}
                    onSaveJob={handleSaveJob}
                    showFull={true}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="applied">
                <Card>
                  <JobsList
                    jobs={jobs.filter((job) => job.applied)}
                    onSelectJob={handleJobSelect}
                    onSaveJob={handleSaveJob}
                    showApplicationStatus={true}
                  />
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {selectedJob && (
            <div className="mt-6">
              <JobDetails
                job={selectedJob}
                onApply={() => setIsApplicationOpen(true)}
                onSave={() => handleSaveJob(selectedJob.id)}
                onClose={() => setSelectedJob(null)}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Apply for Job: {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <JobApplication
            job={selectedJob}
            onSubmit={handleSubmitApplication}
            onCancel={() => setIsApplicationOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
