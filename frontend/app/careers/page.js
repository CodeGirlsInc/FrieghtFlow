"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CareersHero from "@/components/careers/careers-hero";
import CompanyCulture from "@/components/careers/company-culture";
import BenefitsSection from "@/components/careers/benefits-section";
import JobListings from "@/components/careers/job-listings";
import OfficeLocations from "@/components/careers/office-locations";
// import EmployeeTestimonials from "@/components/careers/employee-testimonials";
// import ApplicationProcess from "@/components/careers/application-process";
// import CareersFAQ from "@/components/careers/careers-faq";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobApplication from "@/components/careers/job-application";

// Mock data for job listings
const mockJobs = [
  {
    id: "job-001",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    remote: true,
    postedDate: "2023-03-10T08:00:00Z",
    description:
      "We're looking for a Senior Software Engineer to join our Engineering team. You'll be working on our core platform, building new features and improving existing ones.",
    requirements: [
      "5+ years of experience in software development",
      "Strong proficiency in JavaScript/TypeScript and React",
      "Experience with Node.js and Express",
      "Experience with cloud platforms (AWS, GCP, or Azure)",
      "Strong problem-solving skills and attention to detail",
      "Excellent communication and collaboration skills",
    ],
    responsibilities: [
      "Design, develop, and maintain high-quality software",
      "Collaborate with cross-functional teams to define and implement new features",
      "Write clean, maintainable, and efficient code",
      "Participate in code reviews and provide constructive feedback",
      "Troubleshoot and debug issues in production",
      "Mentor junior engineers and contribute to team growth",
    ],
    salary: {
      min: 130000,
      max: 180000,
      currency: "USD",
    },
  },
  {
    id: "job-002",
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    type: "Full-time",
    remote: true,
    postedDate: "2023-03-12T10:30:00Z",
    description:
      "We're seeking an experienced Product Manager to help define and execute our product strategy. You'll work closely with engineering, design, and business teams to deliver exceptional products.",
    requirements: [
      "3+ years of experience in product management",
      "Strong understanding of user-centered design principles",
      "Experience with agile development methodologies",
      "Excellent analytical and problem-solving skills",
      "Outstanding communication and presentation skills",
      "Ability to prioritize and manage multiple projects",
    ],
    responsibilities: [
      "Define product vision, strategy, and roadmap",
      "Gather and analyze user feedback to inform product decisions",
      "Work with engineering and design teams to deliver features",
      "Define and track key metrics to measure product success",
      "Communicate product plans and updates to stakeholders",
      "Stay up-to-date with industry trends and competitive landscape",
    ],
    salary: {
      min: 120000,
      max: 160000,
      currency: "USD",
    },
  },
  {
    id: "job-003",
    title: "UX/UI Designer",
    department: "Design",
    location: "Seattle, WA",
    type: "Full-time",
    remote: true,
    postedDate: "2023-03-15T09:15:00Z",
    description:
      "We're looking for a talented UX/UI Designer to create beautiful, intuitive interfaces for our products. You'll work closely with product and engineering teams to deliver exceptional user experiences.",
    requirements: [
      "3+ years of experience in UX/UI design",
      "Strong portfolio demonstrating your design process and skills",
      "Proficiency in design tools (Figma, Sketch, Adobe XD)",
      "Experience with design systems and component libraries",
      "Understanding of accessibility standards and best practices",
      "Excellent communication and collaboration skills",
    ],
    responsibilities: [
      "Create wireframes, prototypes, and high-fidelity designs",
      "Conduct user research and usability testing",
      "Collaborate with product and engineering teams",
      "Maintain and evolve our design system",
      "Advocate for user needs and accessibility",
      "Stay up-to-date with design trends and best practices",
    ],
    salary: {
      min: 110000,
      max: 150000,
      currency: "USD",
    },
  },
  {
    id: "job-004",
    title: "Data Scientist",
    department: "Data",
    location: "Boston, MA",
    type: "Full-time",
    remote: false,
    postedDate: "2023-03-18T14:45:00Z",
    description:
      "We're seeking a Data Scientist to help us extract insights from our data. You'll work on building models, analyzing data, and communicating findings to drive business decisions.",
    requirements: [
      "Master's or PhD in Computer Science, Statistics, or related field",
      "3+ years of experience in data science or machine learning",
      "Strong programming skills in Python and SQL",
      "Experience with data visualization tools",
      "Knowledge of statistical analysis and machine learning techniques",
      "Excellent problem-solving and communication skills",
    ],
    responsibilities: [
      "Develop and implement machine learning models",
      "Analyze large datasets to extract insights",
      "Create data visualizations to communicate findings",
      "Collaborate with engineering and product teams",
      "Identify opportunities for data-driven improvements",
      "Stay current with advances in data science and machine learning",
    ],
    salary: {
      min: 125000,
      max: 175000,
      currency: "USD",
    },
  },
  {
    id: "job-005",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Austin, TX",
    type: "Full-time",
    remote: true,
    postedDate: "2023-03-20T11:00:00Z",
    description:
      "We're looking for a DevOps Engineer to help us build and maintain our infrastructure. You'll work on automating deployments, improving monitoring, and ensuring system reliability.",
    requirements: [
      "3+ years of experience in DevOps or Site Reliability Engineering",
      "Strong knowledge of cloud platforms (AWS, GCP, or Azure)",
      "Experience with containerization and orchestration (Docker, Kubernetes)",
      "Proficiency in scripting languages (Python, Bash)",
      "Experience with CI/CD pipelines and infrastructure as code",
      "Strong problem-solving and troubleshooting skills",
    ],
    responsibilities: [
      "Design, implement, and maintain infrastructure",
      "Automate deployment and scaling processes",
      "Implement monitoring and alerting systems",
      "Troubleshoot and resolve infrastructure issues",
      "Collaborate with development teams to improve processes",
      "Stay up-to-date with industry best practices and tools",
    ],
    salary: {
      min: 120000,
      max: 170000,
      currency: "USD",
    },
  },
  {
    id: "job-006",
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Chicago, IL",
    type: "Full-time",
    remote: true,
    postedDate: "2023-03-22T13:30:00Z",
    description:
      "We're seeking a Customer Success Manager to ensure our customers get the most value from our products. You'll build relationships with customers, understand their needs, and help them achieve their goals.",
    requirements: [
      "3+ years of experience in customer success or account management",
      "Strong communication and relationship-building skills",
      "Experience with CRM software (Salesforce, HubSpot)",
      "Ability to understand technical concepts and explain them clearly",
      "Problem-solving mindset and attention to detail",
      "Bachelor's degree or equivalent experience",
    ],
    responsibilities: [
      "Build and maintain relationships with customers",
      "Understand customer needs and help them achieve their goals",
      "Develop and implement customer success strategies",
      "Monitor customer health and identify at-risk accounts",
      "Collaborate with sales, product, and support teams",
      "Drive customer retention and expansion",
    ],
    salary: {
      min: 80000,
      max: 120000,
      currency: "USD",
    },
  },
  {
    id: "job-007",
    title: "Marketing Manager",
    department: "Marketing",
    location: "Denver, CO",
    type: "Full-time",
    remote: true,
    postedDate: "2023-03-25T09:45:00Z",
    description:
      "We're looking for a Marketing Manager to help us grow our brand and acquire new customers. You'll develop and execute marketing campaigns across various channels.",
    requirements: [
      "5+ years of experience in marketing, preferably in B2B SaaS",
      "Experience with digital marketing channels (email, social, content)",
      "Strong analytical skills and data-driven approach",
      "Excellent communication and project management skills",
      "Creative mindset and attention to detail",
      "Bachelor's degree in Marketing or related field",
    ],
    responsibilities: [
      "Develop and execute marketing strategies and campaigns",
      "Manage digital marketing channels and content creation",
      "Analyze campaign performance and optimize for results",
      "Collaborate with product, sales, and design teams",
      "Manage marketing budget and vendor relationships",
      "Stay up-to-date with marketing trends and best practices",
    ],
    salary: {
      min: 90000,
      max: 130000,
      currency: "USD",
    },
  },
  {
    id: "job-008",
    title: "Sales Development Representative",
    department: "Sales",
    location: "Miami, FL",
    type: "Full-time",
    remote: false,
    postedDate: "2023-03-28T10:15:00Z",
    description:
      "We're seeking a Sales Development Representative to help us identify and qualify new business opportunities. You'll be the first point of contact for potential customers and help build our sales pipeline.",
    requirements: [
      "1+ years of experience in sales or customer-facing role",
      "Strong communication and interpersonal skills",
      "Ability to learn and explain technical concepts",
      "Goal-oriented mindset and resilience",
      "Experience with CRM software (Salesforce, HubSpot)",
      "Bachelor's degree or equivalent experience",
    ],
    responsibilities: [
      "Identify and qualify new business opportunities",
      "Conduct outreach to potential customers via email and phone",
      "Schedule meetings for Account Executives",
      "Research prospects and personalize outreach",
      "Maintain accurate records in CRM",
      "Collaborate with marketing and sales teams",
    ],
    salary: {
      min: 60000,
      max: 80000,
      currency: "USD",
      commission: true,
    },
  },
];

// Mock data for departments
const departments = [
  { id: "all", name: "All Departments" },
  { id: "engineering", name: "Engineering" },
  { id: "product", name: "Product" },
  { id: "design", name: "Design" },
  { id: "data", name: "Data" },
  { id: "customer-success", name: "Customer Success" },
  { id: "marketing", name: "Marketing" },
  { id: "sales", name: "Sales" },
];

// Mock data for locations
const locations = [
  { id: "all", name: "All Locations" },
  { id: "san-francisco", name: "San Francisco, CA" },
  { id: "new-york", name: "New York, NY" },
  { id: "seattle", name: "Seattle, WA" },
  { id: "boston", name: "Boston, MA" },
  { id: "austin", name: "Austin, TX" },
  { id: "chicago", name: "Chicago, IL" },
  { id: "denver", name: "Denver, CO" },
  { id: "miami", name: "Miami, FL" },
  { id: "remote", name: "Remote" },
];

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  // Filter jobs based on selected department, location, and search query
  const filteredJobs = mockJobs.filter((job) => {
    // Filter by department
    if (
      selectedDepartment !== "all" &&
      job.department.toLowerCase() !== selectedDepartment.toLowerCase()
    ) {
      return false;
    }

    // Filter by location
    if (selectedLocation !== "all") {
      if (selectedLocation === "remote") {
        if (!job.remote) {
          return false;
        }
      } else if (
        !job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      ) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
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

    // Close the application dialog
    setIsApplicationOpen(false);

    // Show a success message or redirect to a thank you page
    alert("Your application has been submitted successfully!");
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <CareersHero />

      <div className="mt-12">
        <Tabs defaultValue="openings" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="openings">Open Positions</TabsTrigger>
            <TabsTrigger value="culture">Our Culture</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="openings">
            <JobListings
              jobs={filteredJobs}
              departments={departments}
              locations={locations}
              selectedDepartment={selectedDepartment}
              selectedLocation={selectedLocation}
              searchQuery={searchQuery}
              onDepartmentChange={setSelectedDepartment}
              onLocationChange={setSelectedLocation}
              onSearchChange={setSearchQuery}
              onJobSelect={handleJobSelect}
              onApplyToJob={handleApplyToJob}
              selectedJobId={selectedJob?.id}
            />

            <div className="mt-12">
              <ApplicationProcess />
            </div>

            <div className="mt-12">
              <CareersFAQ />
            </div>
          </TabsContent>

          <TabsContent value="culture">
            <CompanyCulture />

            <div className="mt-12">
              <EmployeeTestimonials />
            </div>
          </TabsContent>

          <TabsContent value="benefits">
            <BenefitsSection />
          </TabsContent>

          <TabsContent value="locations">
            <OfficeLocations />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
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
