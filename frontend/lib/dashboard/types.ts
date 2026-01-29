import type { UserRole } from "@/lib/auth-context";

export type ShipmentStatus =
  | "Created"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Delayed"
  | "Cancelled";

export type ActivityEventType =
  | "shipment_created"
  | "status_updated"
  | "payment_received"
  | "issue_reported"
  | "carrier_assigned"
  | "carrier_checked_in";

export interface DashboardAnalytics {
  readonly role: UserRole;
  readonly generatedAt: string; // ISO

  readonly metrics: {
    // SHIPPER
    readonly activeShipments?: number;
    readonly activeShipmentsTrendPct?: number;
    readonly pendingDeliveries?: number;
    readonly totalSpentThisMonth?: number;
    readonly onTimeDeliveryRate?: number; // 0..100

    // CARRIER
    readonly activeJobs?: number;
    readonly availableJobs?: number;
    readonly revenueThisMonth?: number;
    readonly averageRating?: number; // 0..5

    // DISPATCHER
    readonly totalActiveShipments?: number;
    readonly carriersOnline?: number;
    readonly issuesReported?: number;
    readonly systemUtilization?: number; // 0..100
  };

  readonly charts: {
    readonly shipmentStatusDistribution: ReadonlyArray<{
      status: ShipmentStatus;
      count: number;
    }>;
    readonly revenueOrCostOverTime: ReadonlyArray<{
      date: string; // YYYY-MM-DD
      amount: number;
    }>;
    readonly topRoutes: ReadonlyArray<{
      route: string;
      shipments: number;
    }>;
    readonly deliveryPerformance: ReadonlyArray<{
      date: string; // YYYY-MM-DD
      onTimeRate: number; // 0..100
      delayedRate: number; // 0..100
    }>;
  };
}

export interface ActivityActor {
  readonly name: string;
  readonly avatarUrl?: string;
}

export interface ActivityItem {
  readonly id: string;
  readonly type: ActivityEventType;
  readonly title: string;
  readonly description?: string;
  readonly actor?: ActivityActor;
  readonly createdAt: string; // ISO
  readonly isUnread?: boolean;
  readonly entity?: {
    readonly type: "shipment" | "payment" | "issue";
    readonly id: string;
  };
}

export interface RecentShipment {
  readonly id: string;
  readonly origin: string;
  readonly destination: string;
  readonly status: ShipmentStatus;
  readonly carrier: string;
  readonly eta: string; // ISO
}

export interface Paginated<T> {
  readonly items: ReadonlyArray<T>;
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}

export interface CursorPage<T> {
  readonly items: ReadonlyArray<T>;
  readonly nextCursor?: string;
}

