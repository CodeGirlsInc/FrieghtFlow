"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import CaseStudiesHeader from "@/components/case-studies/case-studies-header";
import CaseStudiesList from "@/components/case-studies/case-studies-list";
import CaseStudyFilters from "@/components/case-studies/case-study-filters";
import FeaturedCaseStudy from "@/components/case-studies/featured-case-study";
import CaseStudyDetail from "@/components/case-studies/case-study-detail";
import TestimonialSlider from "@/components/case-studies/testimonial-slider";
import CTASection from "@/components/case-studies/cta-section";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Mock data for case studies
const mockCaseStudies = [
  {
    id: "cs-001",
    slug: "global-foods-supply-chain-optimization",
    title: "Global Foods Supply Chain Optimization",
    subtitle: "How a leading food distributor reduced delivery times by 35%",
    client: "Global Foods Inc.",
    industry: "Food & Beverage",
    location: "Multiple locations across North America",
    logo: "/placeholder.svg?height=80&width=80",
    heroImage: "/placeholder.svg?height=600&width=1200",
    thumbnailImage: "/placeholder.svg?height=400&width=600",
    publishDate: "2023-02-15",
    featured: true,
    challenge:
      "Global Foods Inc., a major food distributor serving over 5,000 restaurants and retailers, was struggling with inefficient delivery routes and high fuel costs. Their existing logistics system couldn't handle the complexity of their growing operation, resulting in delayed deliveries and spoiled perishable goods.",
    solution:
      "FreightFlow implemented a comprehensive supply chain optimization solution that included:\n\n- Real-time route optimization with dynamic rerouting capabilities\n- Temperature-controlled shipment tracking for perishable goods\n- Predictive analytics for demand forecasting\n- Integration with existing warehouse management systems\n- Mobile app for drivers with real-time updates and digital proof of delivery",
    results: [
      {
        metric: "Delivery Time Reduction",
        value: "35%",
        description:
          "Average delivery times decreased from 3.2 days to 2.1 days",
      },
      {
        metric: "Fuel Cost Savings",
        value: "$1.2M",
        description: "Annual fuel savings through optimized routing",
      },
      {
        metric: "Spoilage Reduction",
        value: "42%",
        description:
          "Decrease in perishable goods spoilage through better temperature monitoring",
      },
      {
        metric: "Customer Satisfaction",
        value: "+28%",
        description: "Increase in customer satisfaction scores",
      },
    ],
    testimonial: {
      quote:
        "FreightFlow transformed our logistics operations. We're now able to deliver fresher products faster and at a lower cost. The real-time visibility into our entire supply chain has been a game-changer for our business.",
      author: "Maria Rodriguez",
      title: "VP of Operations",
      company: "Global Foods Inc.",
      image: "/placeholder.svg?height=100&width=100",
    },
    implementation:
      "The implementation process took 12 weeks and was conducted in phases to minimize disruption to ongoing operations. FreightFlow's team worked closely with Global Foods' IT department to ensure seamless integration with existing systems. Driver training was conducted in small groups, with a focus on the mobile application and new delivery protocols.",
    technologies: [
      "Route Optimization",
      "IoT Temperature Sensors",
      "Predictive Analytics",
      "Mobile Applications",
    ],
    tags: [
      "Food Distribution",
      "Route Optimization",
      "Temperature Control",
      "Supply Chain",
    ],
    relatedCaseStudies: ["cs-003", "cs-005", "cs-007"],
  },
  {
    id: "cs-002",
    slug: "tech-innovate-international-shipping",
    title: "Streamlining International Shipping for Tech Manufacturer",
    subtitle: "Reducing customs delays by 60% for a global electronics company",
    client: "Tech Innovate Ltd.",
    industry: "Electronics Manufacturing",
    location: "Global operations, HQ in San Jose, CA",
    logo: "/placeholder.svg?height=80&width=80",
    heroImage: "/placeholder.svg?height=600&width=1200",
    thumbnailImage: "/placeholder.svg?height=400&width=600",
    publishDate: "2023-01-10",
    featured: false,
    challenge:
      "Tech Innovate, a leading electronics manufacturer shipping to 45+ countries, faced significant challenges with international customs clearance. Delays at borders were causing unpredictable delivery times, customer dissatisfaction, and increased storage costs at ports.",
    solution:
      "FreightFlow deployed an international shipping solution featuring:\n\n- Automated customs documentation preparation\n- Real-time tracking of shipments across international borders\n- Predictive clearance time algorithms based on historical data\n- Digital customs broker network in key markets\n- Compliance monitoring for changing international regulations",
    results: [
      {
        metric: "Customs Clearance Time",
        value: "-60%",
        description:
          "Average customs processing time reduced from 5 days to 2 days",
      },
      {
        metric: "Documentation Errors",
        value: "-85%",
        description: "Reduction in documentation errors causing delays",
      },
      {
        metric: "Delivery Predictability",
        value: "94%",
        description:
          "Percentage of shipments delivered within predicted window",
      },
      {
        metric: "Cost Savings",
        value: "$3.4M",
        description:
          "Annual savings from reduced storage fees and expedited shipping",
      },
    ],
    testimonial: {
      quote:
        "The visibility and predictability FreightFlow has brought to our international shipping operations has been invaluable. We can now confidently promise delivery dates to our global customers and consistently meet those commitments.",
      author: "James Chen",
      title: "Global Logistics Director",
      company: "Tech Innovate Ltd.",
      image: "/placeholder.svg?height=100&width=100",
    },
    implementation:
      "The implementation was completed over a 16-week period, beginning with the highest volume shipping lanes between Asia and North America. FreightFlow's team provided comprehensive training to Tech Innovate's logistics team and established connections with customs authorities in key markets.",
    technologies: [
      "Customs Documentation Automation",
      "Predictive Analytics",
      "Regulatory Compliance Monitoring",
      "Global Broker Network",
    ],
    tags: [
      "International Shipping",
      "Customs Clearance",
      "Electronics",
      "Compliance",
    ],
    relatedCaseStudies: ["cs-004", "cs-006", "cs-008"],
  },
  {
    id: "cs-003",
    slug: "pharma-solutions-temperature-controlled",
    title: "Temperature-Controlled Pharmaceutical Distribution",
    subtitle: "Ensuring medication integrity across the cold chain",
    client: "PharmaHealth Solutions",
    industry: "Pharmaceuticals",
    location: "Eastern United States",
    logo: "/placeholder.svg?height=80&width=80",
    heroImage: "/placeholder.svg?height=600&width=1200",
    thumbnailImage: "/placeholder.svg?height=400&width=600",
    publishDate: "2022-11-28",
    featured: true,
    challenge:
      "PharmaHealth Solutions needed to distribute temperature-sensitive medications to hospitals and pharmacies while maintaining strict temperature controls. Their existing system lacked real-time monitoring, resulting in occasional temperature excursions and rejected shipments.",
    solution:
      "FreightFlow implemented a specialized pharmaceutical logistics solution including:\n\n- IoT temperature sensors with real-time monitoring and alerts\n- Validated cold chain transportation processes\n- Automated compliance documentation for regulatory requirements\n- Contingency routing for temperature-sensitive shipments\n- Complete chain of custody tracking",
    results: [
      {
        metric: "Temperature Excursions",
        value: "-98%",
        description:
          "Near elimination of temperature excursions during transit",
      },
      {
        metric: "Rejected Shipments",
        value: "-99%",
        description:
          "Reduction in shipments rejected due to temperature issues",
      },
      {
        metric: "Compliance Documentation",
        value: "100%",
        description:
          "Complete, automated documentation for regulatory compliance",
      },
      {
        metric: "Distribution Costs",
        value: "-22%",
        description: "Overall reduction in pharmaceutical distribution costs",
      },
    ],
    testimonial: {
      quote:
        "FreightFlow's pharmaceutical solution has revolutionized our cold chain operations. We now have complete confidence in the integrity of our shipments and can provide regulators with comprehensive documentation at the touch of a button.",
      author: "Dr. Sarah Johnson",
      title: "Supply Chain Director",
      company: "PharmaHealth Solutions",
      image: "/placeholder.svg?height=100&width=100",
    },
    implementation:
      "The implementation was completed in 10 weeks, with careful validation at each stage to ensure compliance with FDA and other regulatory requirements. FreightFlow worked with PharmaHealth's quality assurance team to validate all processes and documentation.",
    technologies: [
      "IoT Temperature Sensors",
      "Blockchain Chain of Custody",
      "Regulatory Compliance Automation",
      "Cold Chain Validation",
    ],
    tags: [
      "Pharmaceuticals",
      "Cold Chain",
      "Temperature Control",
      "Compliance",
    ],
    relatedCaseStudies: ["cs-001", "cs-007", "cs-009"],
  },
  {
    id: "cs-004",
    slug: "retail-giant-last-mile-delivery",
    title: "Revolutionizing Last-Mile Delivery for Retail Giant",
    subtitle:
      "How FreightFlow helped a major retailer achieve same-day delivery",
    client: "MegaMart Retail",
    industry: "Retail",
    location: "Nationwide, United States",
    logo: "/placeholder.svg?height=80&width=80",
    heroImage: "/placeholder.svg?height=600&width=1200",
    thumbnailImage: "/placeholder.svg?height=400&width=600",
    publishDate: "2022-10-15",
    featured: false,
    challenge:
      "MegaMart, a national retail chain with over 1,200 stores, was struggling to compete with online retailers offering same-day delivery. Their existing delivery network was fragmented, inefficient, and unable to meet customer expectations for fast delivery.",
    solution:
      "FreightFlow designed a comprehensive last-mile delivery solution that included:\n\n- Distributed inventory optimization across stores and micro-fulfillment centers\n- Dynamic delivery zone management based on real-time capacity\n- Crowdsourced delivery driver network integration\n- Customer delivery experience platform with real-time tracking\n- Machine learning for delivery time prediction",
    results: [
      {
        metric: "Same-Day Delivery Coverage",
        value: "94%",
        description: "Percentage of customers eligible for same-day delivery",
      },
      {
        metric: "Delivery Time",
        value: "3.2 hours",
        description: "Average delivery time from order placement",
      },
      {
        metric: "Order Volume",
        value: "+165%",
        description: "Increase in online orders with delivery",
      },
      {
        metric: "Delivery Cost",
        value: "-34%",
        description: "Reduction in per-delivery cost",
      },
    ],
    testimonial: {
      quote:
        "FreightFlow has enabled us to offer Amazon-level delivery service to our customers. The combination of technology and flexible delivery options has transformed our e-commerce business and driven significant growth.",
      author: "Robert Thompson",
      title: "Chief Digital Officer",
      company: "MegaMart Retail",
      image: "/placeholder.svg?height=100&width=100",
    },
    implementation:
      "The solution was rolled out over 6 months, starting with major metropolitan areas and gradually expanding to suburban and rural locations. FreightFlow integrated with MegaMart's existing e-commerce platform and warehouse management systems.",
    technologies: [
      "Distributed Inventory Optimization",
      "Crowdsourced Delivery Network",
      "Machine Learning ETAs",
      "Real-time Tracking",
    ],
    tags: ["Retail", "Last-Mile Delivery", "E-commerce", "Same-Day Delivery"],
    relatedCaseStudies: ["cs-002", "cs-008", "cs-010"],
  },
  {
    id: "cs-005",
    slug: "construction-materials-logistics",
    title: "Construction Materials Logistics Transformation",
    subtitle:
      "Streamlining heavy materials delivery for major construction firm",
    client: "BuildRight Construction",
    industry: "Construction",
    location: "Western United States",
    logo: "/placeholder.svg?height=80&width=80",
    heroImage: "/placeholder.svg?height=600&width=1200",
    thumbnailImage: "/placeholder.svg?height=400&width=600",
    publishDate: "2022-09-05",
    featured: false,
    challenge:
      "BuildRight Construction was experiencing significant project delays due to inconsistent delivery of heavy construction materials. Their manual scheduling process couldn't coordinate effectively between suppliers, haulers, and job sites, resulting in idle crews and equipment.",
    solution:
      "FreightFlow implemented a construction logistics platform featuring:\n\n- Centralized materials ordering and delivery scheduling\n- Real-time tracking of heavy haul shipments\n- Job site delivery coordination with automated notifications\n- Supplier integration for inventory visibility\n- Digital proof of delivery with photo documentation",
    results: [
      {
        metric: "Project Delays",
        value: "-78%",
        description: "Reduction in project delays due to materials logistics",
      },
      {
        metric: "Equipment Utilization",
        value: "+42%",
        description: "Improvement in heavy equipment utilization",
      },
      {
        metric: "Delivery Accuracy",
        value: "97%",
        description:
          "Percentage of deliveries arriving at correct location and time",
      },
      {
        metric: "Annual Savings",
        value: "$4.2M",
        description: "Cost savings from improved efficiency and reduced delays",
      },
    ],
    testimonial: {
      quote:
        "The visibility and coordination FreightFlow has brought to our materials logistics has eliminated one of our biggest sources of project delays. We now have the right materials at the right place at the right time, every time.",
      author: "Michael Johnson",
      title: "Operations Director",
      company: "BuildRight Construction",
      image: "/placeholder.svg?height=100&width=100",
    },
    implementation:
      "The implementation was completed in 14 weeks, with initial deployment focused on concrete and structural steel deliveries. The system was then expanded to cover all construction materials. Integration with BuildRight's project management software ensured alignment with project timelines.",
    technologies: [
      "Heavy Haul Tracking",
      "Job Site Coordination",
      "Supplier Integration",
      "Digital POD",
    ],
    tags: [
      "Construction",
      "Heavy Materials",
      "Job Site Logistics",
      "Supplier Management",
    ],
    relatedCaseStudies: ["cs-001", "cs-007", "cs-009"],
  },
  {
    id: "cs-006",
    slug: "automotive-just-in-time-manufacturing",
    title: "Just-In-Time Manufacturing for Automotive Leader",
    subtitle: "Precision logistics enabling lean manufacturing excellence",
    client: "PrecisionAuto Manufacturing",
    industry: "Automotive",
    location: "Midwest, United States",
    logo: "/placeholder.svg?height=80&width=80",
    heroImage: "/placeholder.svg?height=600&width=1200",
    thumbnailImage: "/placeholder.svg?height=400&width=600",
    publishDate: "2022-08-12",
    featured: false,
    challenge:
      "PrecisionAuto's manufacturing operations required just-in-time delivery of components from hundreds of suppliers. Their existing logistics system couldn't provide the precision timing needed, resulting in production line stoppages and excess inventory costs.",
    solution:
      "FreightFlow deployed a specialized just-in-time logistics solution including:\n\n- Supplier integration with production scheduling\n- Time-slotted delivery appointments with minute-level precision\n- Real-time tracking with geofencing alerts\n- Automated exception management and contingency planning\n- Cross-dock operations for supplier consolidation",
    results: [
      {
        metric: "Production Stoppages",
        value: "-92%",
        description:
          "Reduction in production line stoppages due to parts shortages",
      },
      {
        metric: "Inventory Levels",
        value: "-64%",
        description:
          "Reduction in parts inventory held at manufacturing facilities",
      },
      {
        metric: "Delivery Precision",
        value: "98.7%",
        description:
          "Percentage of deliveries arriving within 15-minute window",
      },
      {
        metric: "Manufacturing Efficiency",
        value: "+23%",
        description: "Increase in overall manufacturing efficiency",
      },
    ],
    testimonial: {
      quote:
        "FreightFlow has mastered the precision timing our manufacturing operations demand. Their system ensures we have exactly what we need, exactly when we need it, enabling us to operate a truly lean manufacturing process.",
      author: "Thomas Wright",
      title: "VP of Manufacturing",
      company: "PrecisionAuto Manufacturing",
      image: "/placeholder.svg?height=100&width=100",
    },
    implementation:
      "The implementation was phased over 20 weeks, beginning with critical components and gradually expanding to all parts. FreightFlow worked closely with PrecisionAuto's manufacturing team to align delivery schedules with production needs and established integration with over 200 suppliers.",
    technologies: [
      "JIT Delivery Scheduling",
      "Supplier Integration",
      "Geofencing",
      "Exception Management",
    ],
    tags: [
      "Automotive",
      "Just-In-Time",
      "Manufacturing",
      "Supplier Management",
    ],
    relatedCaseStudies: ["cs-002", "cs-008", "cs-010"],
  },
  {
    id: "cs-007",
    slug: "fresh-produce-farm-to-table",
    title: "Farm-to-Table Fresh Produce Logistics",
    subtitle: "Connecting local farmers with urban restaurants",
    client: "FreshConnect Network",
    industry: "Agriculture & Food Service",
    location: "California, United States",
    logo: "/placeholder.svg?height=80&width=80",
    heroImage: "/placeholder.svg?height=600&width=1200",
    thumbnailImage: "/placeholder.svg?height=400&width=600",
    publishDate: "2022-07-20",
    featured: false,
    challenge:
      "FreshConnect, a network connecting local farmers with urban restaurants, struggled with the logistics of getting fresh produce from farms to restaurant kitchens quickly while maintaining freshness. Their manual coordination process was inefficient and resulted in food waste.",
    solution:
      "FreightFlow created a specialized farm-to-table logistics platform featuring:\n\n- Harvest-triggered delivery scheduling\n- Temperature-controlled route optimization\n- Restaurant delivery time window management\n- Freshness tracking and documentation\n- Collaborative pickup and delivery scheduling",
    results: [
      {
        metric: "Farm-to-Kitchen Time",
        value: "-68%",
        description: "Reduction in time from harvest to restaurant delivery",
      },
      {
        metric: "Food Waste",
        value: "-72%",
        description: "Reduction in spoilage and food waste",
      },
      {
        metric: "Farmer Participation",
        value: "+156%",
        description: "Increase in farmers participating in the network",
      },
      {
        metric: "Restaurant Satisfaction",
        value: "96%",
        description:
          "Restaurant satisfaction with produce quality and delivery",
      },
    ],
    testimonial: {
      quote:
        "FreightFlow has transformed how we connect farmers with restaurants. Chefs now receive produce that was harvested just hours earlier, at peak freshness. It's revolutionized the farm-to-table movement in our region.",
      author: "Emma Garcia",
      title: "Executive Director",
      company: "FreshConnect Network",
      image: "/placeholder.svg?height=100&width=100",
    },
    implementation:
      "The solution was implemented over 8 weeks, starting with a pilot group of 15 farms and 30 restaurants. The platform was then expanded to include over 100 farms and 200 restaurants across California. FreightFlow provided mobile training for farmers and restaurant staff.",
    technologies: [
      "Harvest Scheduling",
      "Temperature-Controlled Routing",
      "Freshness Tracking",
      "Collaborative Scheduling",
    ],
    tags: ["Agriculture", "Farm-to-Table", "Fresh Produce", "Food Service"],
    relatedCaseStudies: ["cs-001", "cs-003", "cs-005"],
  },
  {
    id: "cs-008",
    slug: "ecommerce-returns-management",
    title: "E-commerce Returns Management Solution",
    subtitle: "Streamlining the reverse logistics process for online retailer",
    client: "ShopDirect Online",
    industry: "E-commerce Retail",
    location: "United States & Canada",
    logo: "/placeholder.svg?height=80&width=80",
    heroImage: "/placeholder.svg?height=600&width=1200",
    thumbnailImage: "/placeholder.svg?height=400&width=600",
    publishDate: "2022-06-15",
    featured: false,
    challenge:
      "ShopDirect, a major online retailer, was struggling with the growing volume of product returns. Their reverse logistics process was inefficient, costly, and resulted in poor customer experience and significant value loss in returned merchandise.",
    solution:
      "FreightFlow implemented a comprehensive returns management solution including:\n\n- Customer-friendly returns portal with multiple return options\n- Distributed returns processing network\n- Intelligent routing of returns based on disposition\n- Automated returns processing and restocking\n- Data analytics for returns reduction strategies",
    results: [
      {
        metric: "Returns Processing Time",
        value: "-76%",
        description: "Reduction in time to process and resolve returns",
      },
      {
        metric: "Returns Cost",
        value: "-42%",
        description: "Reduction in per-item returns processing cost",
      },
      {
        metric: "Customer Satisfaction",
        value: "+58%",
        description:
          "Improvement in customer satisfaction with returns process",
      },
      {
        metric: "Returned Item Value Recovery",
        value: "+64%",
        description: "Increase in value recovered from returned merchandise",
      },
    ],
    testimonial: {
      quote:
        "FreightFlow transformed our returns process from a cost center to a competitive advantage. Our customers love the easy returns experience, and we're recovering significantly more value from returned merchandise.",
      author: "Jennifer Adams",
      title: "Director of Customer Experience",
      company: "ShopDirect Online",
      image: "/placeholder.svg?height=100&width=100",
    },
    implementation:
      "The implementation was completed in 12 weeks, with initial focus on high-volume return categories. The solution was integrated with ShopDirect's e-commerce platform and warehouse management system. FreightFlow established a network of returns processing centers to minimize transportation costs.",
    technologies: [
      "Returns Portal",
      "Disposition Routing",
      "Automated Processing",
      "Returns Analytics",
    ],
    tags: [
      "E-commerce",
      "Returns Management",
      "Reverse Logistics",
      "Customer Experience",
    ],
    relatedCaseStudies: ["cs-002", "cs-004", "cs-010"],
  },
];

// Mock data for industries
const industries = [
  "Food & Beverage",
  "Electronics Manufacturing",
  "Pharmaceuticals",
  "Retail",
  "Construction",
  "Automotive",
  "Agriculture & Food Service",
  "E-commerce Retail",
];

// Mock data for solution types
const solutionTypes = [
  "Route Optimization",
  "Temperature Control",
  "International Shipping",
  "Last-Mile Delivery",
  "Heavy Materials Logistics",
  "Just-In-Time Delivery",
  "Farm-to-Table",
  "Returns Management",
];

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState(mockCaseStudies);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    industry: [],
    solutionType: [],
    searchQuery: "",
  });

  // Filter case studies based on active filters
  const filteredCaseStudies = caseStudies.filter((caseStudy) => {
    // Filter by industry
    if (
      activeFilters.industry.length > 0 &&
      !activeFilters.industry.includes(caseStudy.industry)
    ) {
      return false;
    }

    // Filter by solution type
    if (activeFilters.solutionType.length > 0) {
      const matchesSolution = activeFilters.solutionType.some(
        (solution) =>
          caseStudy.technologies.includes(solution) ||
          caseStudy.tags.includes(solution)
      );
      if (!matchesSolution) return false;
    }

    // Filter by search query
    if (activeFilters.searchQuery) {
      const query = activeFilters.searchQuery.toLowerCase();
      return (
        caseStudy.title.toLowerCase().includes(query) ||
        caseStudy.subtitle.toLowerCase().includes(query) ||
        caseStudy.client.toLowerCase().includes(query) ||
        caseStudy.industry.toLowerCase().includes(query) ||
        caseStudy.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Get featured case studies
  const featuredCaseStudies = caseStudies.filter((cs) => cs.featured);

  const handleCaseStudySelect = (caseStudy) => {
    setSelectedCaseStudy(caseStudy);
    setIsDetailOpen(true);
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const handleSearchChange = (query) => {
    setActiveFilters({
      ...activeFilters,
      searchQuery: query,
    });
  };

  // Get related case studies for the selected case study
  const getRelatedCaseStudies = () => {
    if (!selectedCaseStudy) return [];

    return selectedCaseStudy.relatedCaseStudies
      .map((id) => caseStudies.find((cs) => cs.id === id))
      .filter(Boolean);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <CaseStudiesHeader
        onSearch={handleSearchChange}
        caseStudyCount={filteredCaseStudies.length}
      />

      <div className="mt-8">
        {featuredCaseStudies.length > 0 && (
          <div className="mb-12">
            <FeaturedCaseStudy
              caseStudy={featuredCaseStudies[0]}
              onSelect={handleCaseStudySelect}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <CaseStudyFilters
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              industries={industries}
              solutionTypes={solutionTypes}
            />
          </div>

          <div className="md:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="all">All Case Studies</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Card>
                  <CaseStudiesList
                    caseStudies={filteredCaseStudies}
                    onSelect={handleCaseStudySelect}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="featured">
                <Card>
                  <CaseStudiesList
                    caseStudies={filteredCaseStudies.filter(
                      (cs) => cs.featured
                    )}
                    onSelect={handleCaseStudySelect}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="recent">
                <Card>
                  <CaseStudiesList
                    caseStudies={filteredCaseStudies
                      .sort(
                        (a, b) =>
                          new Date(b.publishDate) - new Date(a.publishDate)
                      )
                      .slice(0, 6)}
                    onSelect={handleCaseStudySelect}
                  />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="mt-16">
          <TestimonialSlider
            testimonials={caseStudies.map((cs) => cs.testimonial)}
          />
        </div>

        <div className="mt-16">
          <CTASection />
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCaseStudy && (
            <CaseStudyDetail
              caseStudy={selectedCaseStudy}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
