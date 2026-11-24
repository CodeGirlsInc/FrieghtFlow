import { apiClient } from './client';
import type { UserRole } from '../../types/auth.types';

/**
 * Canonical preference keys, matching the backend `notification-preferences`
 * module (backend/src/notification-preferences):
 *  - entity columns on NotificationPreferences
 *  - the fields accepted by UpdateNotificationPreferencesDto
 * Keep this list in sync with that module.
 */
export type NotificationPreferenceKey =
  | 'shipmentAccepted'
  | 'shipmentInTransit'
  | 'shipmentDelivered'
  | 'shipmentCompleted'
  | 'shipmentCancelled'
  | 'shipmentDisputed'
  | 'disputeResolved';

/** Raw shape returned by `GET /notifications/preferences` (the entity). */
export interface NotificationPreferencesResponse {
  id: string;
  userId: string;
  shipmentAccepted: boolean;
  shipmentInTransit: boolean;
  shipmentDelivered: boolean;
  shipmentCompleted: boolean;
  shipmentCancelled: boolean;
  shipmentDisputed: boolean;
  disputeResolved: boolean;
  updatedAt: string;
}

/** Partial patch accepted by `PATCH /notifications/preferences`. */
export type NotificationPreferencesPatch = Partial<
  Record<NotificationPreferenceKey, boolean>
>;

/** UI-friendly, display-ready representation of a single toggle. */
export interface NotificationPreference {
  type: NotificationPreferenceKey;
  label: string;
  description: string;
  enabled: boolean;
}

/**
 * Per-key copy. The default descriptions describe events from the shipper's
 * side; `carrierDescription` replaces it for carrier users — the backend
 * emails carriers on the same preference keys, so they need carrier-relevant
 * wording instead of the shipper's.
 */
type PreferenceMeta = {
  label: string;
  description: string;
  /** Carrier-side description; falls back to `description` when omitted. */
  carrierDescription?: string;
};

const PREFERENCE_META: Record<NotificationPreferenceKey, PreferenceMeta> = {
  shipmentAccepted: {
    label: 'Shipment Accepted',
    description: 'When a carrier accepts your shipment.',
    carrierDescription: 'When you accept a shipment.',
  },
  shipmentInTransit: {
    label: 'Shipment In Transit',
    description: 'When your shipment is picked up and in transit.',
    carrierDescription: 'When you pick up a shipment and it is in transit.',
  },
  shipmentDelivered: {
    label: 'Shipment Delivered',
    description: 'When your shipment is delivered.',
    carrierDescription: 'When you deliver a shipment.',
  },
  shipmentCompleted: {
    label: 'Shipment Completed',
    description: 'When a delivery is confirmed and the shipment is completed.',
    carrierDescription: 'When delivery is confirmed and the shipment is completed.',
  },
  shipmentCancelled: {
    label: 'Shipment Cancelled',
    description: 'When a shipment is cancelled.',
    carrierDescription: 'When a shipment you accepted is cancelled.',
  },
  shipmentDisputed: {
    label: 'Dispute Opened',
    description: 'When a dispute is raised on a shipment.',
    carrierDescription: 'When a dispute is raised on a shipment you accepted.',
  },
  disputeResolved: {
    label: 'Dispute Resolved',
    description: 'When a dispute is resolved.',
    carrierDescription: 'When a dispute on a shipment you accepted is resolved.',
  },
};

/** Stable, display order of the preference toggles. */
export const NOTIFICATION_PREFERENCE_KEYS = Object.keys(
  PREFERENCE_META,
) as NotificationPreferenceKey[];

/** Pick the description that matches the viewer's role (#1848). */
function preferenceDescription(
  type: NotificationPreferenceKey,
  role?: UserRole,
): string {
  const meta = PREFERENCE_META[type];
  return role === 'carrier'
    ? meta.carrierDescription ?? meta.description
    : meta.description;
}

/** Adapt the backend entity into an ordered, display-ready list for the UI. */
export function toPreferenceList(
  res: NotificationPreferencesResponse,
  role?: UserRole,
): NotificationPreference[] {
  return NOTIFICATION_PREFERENCE_KEYS.map((type) => ({
    type,
    label: PREFERENCE_META[type].label,
    description: preferenceDescription(type, role),
    enabled: Boolean(res[type]),
  }));
}

/** Default list used when preferences cannot be loaded (all channels on). */
export function defaultPreferenceList(
  role?: UserRole,
): NotificationPreference[] {
  return NOTIFICATION_PREFERENCE_KEYS.map((type) => ({
    type,
    label: PREFERENCE_META[type].label,
    description: preferenceDescription(type, role),
    enabled: true,
  }));
}

export const notificationsApi = {
  getPreferences: async (
    role?: UserRole,
  ): Promise<NotificationPreference[]> => {
    const res = await apiClient<NotificationPreferencesResponse>(
      '/notifications/preferences',
    );
    return toPreferenceList(res, role);
  },

  updatePreferences: (
    patch: NotificationPreferencesPatch,
  ): Promise<NotificationPreferencesResponse> =>
    apiClient<NotificationPreferencesResponse>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
};
