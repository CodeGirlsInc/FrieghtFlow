import { useState } from "react";

import {
  ErrorBoundary,
} from "./ErrorBoundary";

function DashboardSection() {
  return (
    <div>
      Dashboard Content
    </div>
  );
}

function ShipmentSection() {
  return (
    <div>
      Shipment Content
    </div>
  );
}

function PaymentsSection() {

  const [crash, setCrash] =
    useState(false);

  if (crash) {
    throw new Error(
      "Demo crash"
    );
  }

  return (
    <button
      onClick={() =>
        setCrash(true)
      }
    >
      Trigger Error
    </button>
  );
}

export function ErrorBoundaryDemo() {
  return (
    <div className="space-y-6">

      <ErrorBoundary>
        <DashboardSection />
      </ErrorBoundary>

      <ErrorBoundary>
        <ShipmentSection />
      </ErrorBoundary>

      <ErrorBoundary>
        <PaymentsSection />
      </ErrorBoundary>

    </div>
  );
}