import React from "react";
import { render, screen } from "@testing-library/react";
import KPIGrid from "@/components/dashboard/KPIGrid";
import { getMockDashboardAnalytics } from "@/lib/mock-data/dashboard";

describe("KPIGrid role-based rendering", () => {
  it("renders SHIPPER metrics", () => {
    const analytics = getMockDashboardAnalytics("SHIPPER");
    render(<KPIGrid role="SHIPPER" analytics={analytics} />);
    expect(screen.getByText("Active Shipments")).toBeInTheDocument();
    expect(screen.getByText("Pending Deliveries")).toBeInTheDocument();
    expect(screen.getByText("Total Spent (MTD)")).toBeInTheDocument();
    expect(screen.getByText("On‑Time Delivery Rate")).toBeInTheDocument();
  });

  it("renders CARRIER metrics", () => {
    const analytics = getMockDashboardAnalytics("CARRIER");
    render(<KPIGrid role="CARRIER" analytics={analytics} />);
    expect(screen.getByText("Active Jobs")).toBeInTheDocument();
    expect(screen.getByText("Available Jobs")).toBeInTheDocument();
    expect(screen.getByText("Revenue (MTD)")).toBeInTheDocument();
    expect(screen.getByText("Average Rating")).toBeInTheDocument();
  });

  it("renders DISPATCHER metrics", () => {
    const analytics = getMockDashboardAnalytics("DISPATCHER");
    render(<KPIGrid role="DISPATCHER" analytics={analytics} />);
    expect(screen.getByText("Total Active Shipments")).toBeInTheDocument();
    expect(screen.getByText("Carriers Online")).toBeInTheDocument();
    expect(screen.getByText("Issues Reported")).toBeInTheDocument();
    expect(screen.getByText("System Utilization")).toBeInTheDocument();
  });
});

