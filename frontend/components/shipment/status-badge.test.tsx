import React from "react";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./status-badge";
import { ShipmentStatus } from "../../types/shipment.types";

describe("StatusBadge", () => {
  it("should render the correct label for PENDING", () => {
    render(<StatusBadge status={ShipmentStatus.PENDING} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should render the correct label for IN_TRANSIT", () => {
    render(<StatusBadge status={ShipmentStatus.IN_TRANSIT} />);
    expect(screen.getByText("In Transit")).toBeInTheDocument();
  });

  it("should render the correct label for DELIVERED", () => {
    render(<StatusBadge status={ShipmentStatus.DELIVERED} />);
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("should render the correct label for COMPLETED", () => {
    render(<StatusBadge status={ShipmentStatus.COMPLETED} />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("should render the correct label for CANCELLED", () => {
    render(<StatusBadge status={ShipmentStatus.CANCELLED} />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("should render the correct label for DISPUTED", () => {
    render(<StatusBadge status={ShipmentStatus.DISPUTED} />);
    expect(screen.getByText("Disputed")).toBeInTheDocument();
  });

  it("should render the correct label for ACCEPTED", () => {
    render(<StatusBadge status={ShipmentStatus.ACCEPTED} />);
    expect(screen.getByText("Accepted")).toBeInTheDocument();
  });

  it("should render as a span element", () => {
    render(<StatusBadge status={ShipmentStatus.PENDING} />);
    const badge = screen.getByText("Pending");
    expect(badge.tagName).toBe("SPAN");
  });

  it("should include base styling classes", () => {
    render(<StatusBadge status={ShipmentStatus.PENDING} />);
    const badge = screen.getByText("Pending");
    expect(badge.className).toContain("inline-flex");
    expect(badge.className).toContain("rounded-full");
  });

  it("should merge custom className", () => {
    render(
      <StatusBadge status={ShipmentStatus.PENDING} className="custom-class" />,
    );
    const badge = screen.getByText("Pending");
    expect(badge.className).toContain("custom-class");
  });
});
