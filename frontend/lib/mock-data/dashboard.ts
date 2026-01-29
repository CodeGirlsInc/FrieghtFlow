import type { UserRole } from "@/lib/auth-context";
import type {
  ActivityItem,
  DashboardAnalytics,
  Paginated,
  RecentShipment,
  ShipmentStatus,
  CursorPage,
} from "@/lib/dashboard/types";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function seeded(seed: number) {
  // Deterministic LCG
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const ROUTES = [
  "Lagos → Abuja",
  "Port Harcourt → Lagos",
  "Kano → Kaduna",
  "Enugu → Onitsha",
  "Ibadan → Lagos",
  "Accra → Kumasi",
  "Nairobi → Mombasa",
  "Cape Town → Johannesburg",
];

const CARRIERS = [
  "SwiftLine Logistics",
  "Atlas Freight Co.",
  "BlueRoad Carriers",
  "PeakHaul Transport",
  "Unity Trucking",
];

const STATUS_POOL: ShipmentStatus[] = [
  "Created",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Delayed",
];

export function getMockDashboardAnalytics(role: UserRole): DashboardAnalytics {
  const seedBase = role === "SHIPPER" ? 11 : role === "CARRIER" ? 22 : 33;
  const rand = seeded(seedBase + new Date().getDate());

  const now = new Date();
  const statusDist = STATUS_POOL.map((status) => ({
    status,
    count: Math.floor(8 + rand() * 40),
  }));
  // Make "Delivered" a bit larger
  const deliveredIdx = statusDist.findIndex((x) => x.status === "Delivered");
  if (deliveredIdx >= 0) statusDist[deliveredIdx] = { ...statusDist[deliveredIdx], count: statusDist[deliveredIdx].count + 35 };

  const revenueOrCostOverTime = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (29 - i));
    const base = role === "SHIPPER" ? 1800 : role === "CARRIER" ? 1400 : 1600;
    const wave = Math.sin(i / 4) * 180;
    const noise = (rand() - 0.5) * 220;
    return {
      date: toYmd(d),
      amount: Math.round(base + wave + noise + i * (role === "CARRIER" ? 8 : 5)),
    };
  });

  const topRoutes = Array.from({ length: 6 }).map((_, i) => ({
    route: ROUTES[i % ROUTES.length],
    shipments: Math.floor(8 + rand() * 40),
  }));

  const deliveryPerformance = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (29 - i));
    const onTime = clamp(86 + Math.sin(i / 5) * 4 + (rand() - 0.5) * 6, 60, 99);
    return {
      date: toYmd(d),
      onTimeRate: Math.round(onTime * 10) / 10,
      delayedRate: Math.round((100 - onTime) * 10) / 10,
    };
  });

  const metricsByRole =
    role === "SHIPPER"
      ? {
          activeShipments: Math.floor(10 + rand() * 40),
          activeShipmentsTrendPct: Math.round((rand() * 16 - 6) * 10) / 10,
          pendingDeliveries: Math.floor(4 + rand() * 18),
          totalSpentThisMonth: Math.round(25000 + rand() * 95000),
          onTimeDeliveryRate: Math.round(clamp(88 + (rand() - 0.5) * 8, 60, 99) * 10) / 10,
        }
      : role === "CARRIER"
        ? {
            activeJobs: Math.floor(6 + rand() * 22),
            availableJobs: Math.floor(10 + rand() * 40),
            revenueThisMonth: Math.round(18000 + rand() * 78000),
            averageRating: Math.round(clamp(4.1 + (rand() - 0.5) * 0.8, 3.2, 5) * 10) / 10,
          }
        : {
            totalActiveShipments: Math.floor(25 + rand() * 110),
            carriersOnline: Math.floor(12 + rand() * 70),
            issuesReported: Math.floor(rand() * 14),
            systemUtilization: Math.round(clamp(62 + (rand() - 0.5) * 18, 30, 95) * 10) / 10,
          };

  return {
    role,
    generatedAt: now.toISOString(),
    metrics: metricsByRole,
    charts: {
      shipmentStatusDistribution: statusDist,
      revenueOrCostOverTime,
      topRoutes,
      deliveryPerformance,
    },
  };
}

export function getMockRecentActivity(props: {
  role: UserRole;
  cursor?: string;
  limit: number;
}): CursorPage<ActivityItem> {
  const { role, cursor, limit } = props;
  const page = cursor ? Number(cursor) : 0;
  const seedBase = role === "SHIPPER" ? 101 : role === "CARRIER" ? 202 : 303;
  const rand = seeded(seedBase + page * 1000 + new Date().getDate());

  const now = new Date();
  const items: ActivityItem[] = Array.from({ length: limit }).map((_, i) => {
    const idx = page * limit + i;
    const minsAgo = Math.floor(5 + rand() * 60 * 24);
    const createdAt = new Date(now.getTime() - minsAgo * 60 * 1000).toISOString();
    const shipmentId = `SHP-${String(10000 + (idx % 9000)).padStart(5, "0")}`;
    const typeRoll = rand();
    const type =
      typeRoll < 0.25
        ? "shipment_created"
        : typeRoll < 0.55
          ? "status_updated"
          : typeRoll < 0.75
            ? "payment_received"
            : typeRoll < 0.9
              ? "carrier_assigned"
              : "issue_reported";

    const titleByType: Record<ActivityItem["type"], string> = {
      shipment_created: `Shipment created (${shipmentId})`,
      status_updated: `Shipment status updated (${shipmentId})`,
      payment_received: `Payment received (${shipmentId})`,
      issue_reported: `Issue reported (${shipmentId})`,
      carrier_assigned: `Carrier assigned (${shipmentId})`,
      carrier_checked_in: `Carrier checked in`,
    };

    const descriptionByType: Partial<Record<ActivityItem["type"], string>> = {
      shipment_created: `Route: ${ROUTES[Math.floor(rand() * ROUTES.length)]}`,
      status_updated: `New status: ${STATUS_POOL[Math.floor(rand() * STATUS_POOL.length)]}`,
      payment_received: `Amount: ₦${Math.round(5000 + rand() * 45000).toLocaleString()}`,
      issue_reported: `Reason: Delay at checkpoint`,
      carrier_assigned: `Carrier: ${CARRIERS[Math.floor(rand() * CARRIERS.length)]}`,
    };

    const isUnread = page === 0 && i < 4;

    return {
      id: `${role}-${page}-${i}-${idx}`,
      type,
      title: titleByType[type],
      description: descriptionByType[type],
      actor: {
        name: rand() > 0.5 ? "Operations" : rand() > 0.5 ? "Dispatch" : "System",
      },
      createdAt,
      isUnread,
      entity: type === "payment_received" ? { type: "payment", id: shipmentId } : { type: "shipment", id: shipmentId },
    };
  });

  return {
    items,
    nextCursor: page < 4 ? String(page + 1) : undefined,
  };
}

export function getMockRecentShipments(props: {
  role: UserRole;
  page: number;
  pageSize: number;
}): Paginated<RecentShipment> {
  const { role, page, pageSize } = props;
  const seedBase = role === "SHIPPER" ? 909 : role === "CARRIER" ? 808 : 707;
  const rand = seeded(seedBase + page * 100 + new Date().getDate());

  const total = 42;
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const now = new Date();

  const items: RecentShipment[] = [];
  for (let i = start; i < end; i++) {
    const etaHours = Math.floor(4 + rand() * 96);
    const eta = new Date(now.getTime() + etaHours * 60 * 60 * 1000);
    const route = ROUTES[i % ROUTES.length];
    const [origin, destination] = route.split(" → ");
    items.push({
      id: `SHP-${String(12000 + i).padStart(5, "0")}`,
      origin,
      destination,
      status: STATUS_POOL[Math.floor(rand() * STATUS_POOL.length)],
      carrier: CARRIERS[Math.floor(rand() * CARRIERS.length)],
      eta: eta.toISOString(),
    });
  }

  return { items, page, pageSize, total };
}

export function getMockRecentShipmentsCursor(props: {
  role: UserRole;
  cursor?: string;
  limit: number;
}): CursorPage<RecentShipment> {
  const { role, cursor, limit } = props;
  const seedBase = role === "SHIPPER" ? 909 : role === "CARRIER" ? 808 : 707;
  
  // Parse cursor to get current offset, or start at 0
  const offset = cursor ? parseInt(cursor, 10) : 0;
  const rand = seeded(seedBase + offset + new Date().getDate());

  const total = 42;
  const start = offset;
  const end = Math.min(start + limit, total);
  const now = new Date();

  const items: RecentShipment[] = [];
  for (let i = start; i < end; i++) {
    const etaHours = Math.floor(4 + rand() * 96);
    const eta = new Date(now.getTime() + etaHours * 60 * 60 * 1000);
    const route = ROUTES[i % ROUTES.length];
    const [origin, destination] = route.split(" → ");
    items.push({
      id: `SHP-${String(12000 + i).padStart(5, "0")}`,
      origin,
      destination,
      status: STATUS_POOL[Math.floor(rand() * STATUS_POOL.length)],
      carrier: CARRIERS[Math.floor(rand() * CARRIERS.length)],
      eta: eta.toISOString(),
    });
  }

  // Return next cursor if there are more items
  const nextCursor = end < total ? String(end) : undefined;

  return { items, nextCursor };
}

