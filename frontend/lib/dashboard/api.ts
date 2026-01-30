import type { UserRole } from "@/lib/auth-context";
import type {
  ActivityItem,
  CursorPage,
  DashboardAnalytics,
  Paginated,
  RecentShipment,
} from "@/lib/dashboard/types";
import {
  getMockDashboardAnalytics,
  getMockRecentActivity,
  getMockRecentShipments,
  getMockRecentShipmentsCursor,
} from "@/lib/mock-data/dashboard";

function getApiBaseUrl(): string | undefined {
  const a = process.env.NEXT_PUBLIC_API_URL?.trim();
  const b = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const base = a || b || "";
  return base ? base.replace(/\/+$/, "") : undefined;
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) return path.startsWith("/") ? path : `/${path}`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers ?? {}),
  };

  const res = await fetch(buildUrl(path), { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function fetchDashboardAnalytics(role: UserRole): Promise<DashboardAnalytics> {
  try {
    return await fetchJson<DashboardAnalytics>("/api/v1/analytics/dashboard", {
      method: "GET",
      headers: { "x-user-role": role },
    });
  } catch {
    return getMockDashboardAnalytics(role);
  }
}

export async function fetchRecentActivity(props: {
  role: UserRole;
  cursor?: string;
  limit: number;
}): Promise<CursorPage<ActivityItem>> {
  const { role, cursor, limit } = props;

  try {
    const qs = new URLSearchParams();
    qs.set("limit", String(limit));
    if (cursor) qs.set("cursor", cursor);

    return await fetchJson<CursorPage<ActivityItem>>(
      `/api/v1/activity/recent?${qs.toString()}`,
      { method: "GET", headers: { "x-user-role": role } }
    );
  } catch {
    return getMockRecentActivity({ role, cursor, limit });
  }
}

export async function fetchRecentShipments(props: {
  role: UserRole;
  page: number;
  pageSize: number;
}): Promise<Paginated<RecentShipment>> {
  const { role, page, pageSize } = props;

  try {
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("pageSize", String(pageSize));
    return await fetchJson<Paginated<RecentShipment>>(
      `/api/v1/shipments/recent?${qs.toString()}`,
      { method: "GET", headers: { "x-user-role": role } }
    );
  } catch {
    return getMockRecentShipments({ role, page, pageSize });
  }
}

export async function fetchRecentShipmentsCursor(props: {
  role: UserRole;
  cursor?: string;
  limit: number;
}): Promise<CursorPage<RecentShipment>> {
  const { role, cursor, limit } = props;

  try {
    const qs = new URLSearchParams();
    qs.set("limit", String(limit));
    if (cursor) qs.set("cursor", cursor);

    return await fetchJson<CursorPage<RecentShipment>>(
      `/api/v1/shipments/recent?${qs.toString()}`,
      { method: "GET", headers: { "x-user-role": role } }
    );
  } catch {
    return getMockRecentShipmentsCursor({ role, cursor, limit });
  }
}

