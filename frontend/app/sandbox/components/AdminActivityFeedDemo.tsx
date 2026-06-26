'use client';

import { AdminActivityFeed, ActivityEvent, EventType } from './AdminActivityFeed';

// ── Mock data ─────────────────────────────────────────────────────────────────

const EVENT_TYPES: EventType[] = [
  'user_registered',
  'shipment_created',
  'dispute_filed',
  'payment_processed',
  'carrier_verified',
];

function generateEvents(count: number, startOffset: number): ActivityEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = (startOffset + i) % EVENT_TYPES.length;
    const type = EVENT_TYPES[idx];
    const minutesAgo = startOffset + i * 3;
    return {
      id: `evt-${startOffset + i}`,
      type,
      description: DESCRIPTIONS[type][i % DESCRIPTIONS[type].length],
      actor: ACTORS[(startOffset + i) % ACTORS.length],
      timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
    };
  });
}

const DESCRIPTIONS: Record<EventType, string[]> = {
  user_registered: [
    'New shipper account created',
    'Carrier registration completed',
    'Enterprise account onboarded',
  ],
  shipment_created: [
    'Shipment FF-00198 created: Lagos → Abuja',
    'Shipment FF-00199 created: Kano → Port Harcourt',
    'Batch of 3 shipments created',
  ],
  dispute_filed: [
    'Dispute on shipment FF-00145: damaged cargo',
    'Dispute on shipment FF-00133: late delivery',
    'Dispute on shipment FF-00122: missing items',
  ],
  payment_processed: [
    'Payment of $245.00 processed for FF-00198',
    'Invoice #INV-0041 settled — $1,200.00',
    'Carrier payout of $180.00 released',
  ],
  carrier_verified: [
    'Carrier SwiftHaul Logistics verified',
    'Eagle Freight Co. certification approved',
    'Meridian Cargo KYC completed',
  ],
};

const ACTORS = [
  'admin@freightflow.io',
  'system',
  'alice.smith@example.com',
  'bob.carrier@example.com',
  'support@freightflow.io',
];

const PAGE_SIZE = 10;

async function fetchMockEvents(offset: number): Promise<ActivityEvent[]> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 300));
  const total = 35;
  const remaining = total - offset;
  if (remaining <= 0) return [];
  return generateEvents(Math.min(PAGE_SIZE, remaining), offset);
}

// ── Demo wrapper ──────────────────────────────────────────────────────────────

export function AdminActivityFeedDemo() {
  return (
    <AdminActivityFeed
      fetchEvents={fetchMockEvents}
      pageSize={PAGE_SIZE}
      refreshInterval={30_000}
    />
  );
}
