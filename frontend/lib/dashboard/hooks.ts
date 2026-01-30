"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { UserRole } from "@/lib/auth-context";
import type { ActivityItem, DashboardAnalytics, Paginated, RecentShipment } from "@/lib/dashboard/types";
import { fetchDashboardAnalytics, fetchRecentActivity, fetchRecentShipments, fetchRecentShipmentsCursor } from "@/lib/dashboard/api";

export function useDashboardAnalytics(role: UserRole) {
  return useQuery<DashboardAnalytics>({
    queryKey: ["dashboardAnalytics", role],
    queryFn: () => fetchDashboardAnalytics(role),
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}

export function useRecentActivity(role: UserRole, pageSize = 10) {
  return useInfiniteQuery({
    queryKey: ["recentActivity", role, pageSize],
    queryFn: ({ pageParam }) =>
      fetchRecentActivity({
        role,
        cursor: pageParam as string | undefined,
        limit: pageSize,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}

export function useRecentShipments(props: { role: UserRole; page: number; pageSize: number }) {
  const { role, page, pageSize } = props;
  return useQuery<Paginated<RecentShipment>>({
    queryKey: ["recentShipments", role, page, pageSize],
    queryFn: () => fetchRecentShipments({ role, page, pageSize }),
    keepPreviousData: true,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}

export function useRecentShipmentsInfinite(props: { role: UserRole; pageSize: number }) {
  const { role, pageSize } = props;
  return useInfiniteQuery({
    queryKey: ["recentShipmentsInfinite", role, pageSize],
    queryFn: ({ pageParam }) =>
      fetchRecentShipmentsCursor({
        role,
        cursor: pageParam as string | undefined,
        limit: pageSize,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}

export function flattenActivityPages(pages?: Array<{ items: ReadonlyArray<ActivityItem> }>) {
  return (pages ?? []).flatMap((p) => p.items);
}

export function flattenShipmentPages(pages?: Array<{ items: ReadonlyArray<RecentShipment> }>) {
  return (pages ?? []).flatMap((p) => p.items);
}

