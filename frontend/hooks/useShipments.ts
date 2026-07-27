'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { shipmentApi } from '../lib/api/shipment.api';
import type {
  QueryShipmentParams,
  CreateShipmentPayload,
} from '../types/shipment.types';

// ── List ──────────────────────────────────────────────────────────────────────

export function useShipmentList(params: QueryShipmentParams = {}) {
  return useQuery({
    queryKey: queryKeys.shipments.list(params),
    queryFn: () => shipmentApi.list(params),
  });
}

// ── Marketplace ───────────────────────────────────────────────────────────────

export function useMarketplace(params: QueryShipmentParams = {}) {
  return useQuery({
    queryKey: queryKeys.shipments.marketplace(params),
    queryFn: () => shipmentApi.marketplace(params),
  });
}

// ── Detail ────────────────────────────────────────────────────────────────────

export function useShipmentDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(id),
    queryFn: () => shipmentApi.getById(id),
    enabled: !!id,
  });
}

// ── History ───────────────────────────────────────────────────────────────────

export function useShipmentHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.shipments.history(id),
    queryFn: () => shipmentApi.getHistory(id),
    enabled: !!id,
  });
}

// ── Track by number ───────────────────────────────────────────────────────────

export function useTrackShipment(trackingNumber: string) {
  return useQuery({
    queryKey: queryKeys.shipments.track(trackingNumber),
    queryFn: () => shipmentApi.track(trackingNumber),
    enabled: !!trackingNumber,
  });
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShipmentPayload) => shipmentApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
    },
  });
}

// ── Accept ────────────────────────────────────────────────────────────────────

export function useAcceptShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipmentApi.accept(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.marketplace({}) });
    },
  });
}

// ── Pickup ────────────────────────────────────────────────────────────────────

export function usePickupShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipmentApi.pickup(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}

// ── Mark delivered ────────────────────────────────────────────────────────────

export function useMarkDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipmentApi.markDelivered(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}

// ── Confirm delivery ──────────────────────────────────────────────────────────

export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipmentApi.confirmDelivery(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

// ── Cancel ────────────────────────────────────────────────────────────────────

export function useCancelShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      shipmentApi.cancel(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}

// ── Raise dispute ─────────────────────────────────────────────────────────────

export function useRaiseDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      shipmentApi.raiseDispute(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
    },
  });
}
