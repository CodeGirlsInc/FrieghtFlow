import { apiClient } from './client';

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

const PREFERENCE_META: Record<
  NotificationPreferenceKey,
  { label: string; description: string }
> = {
  shipmentAccepted: {
    label: 'Shipment Accepted',
    description: 'When a carrier accepts your shipment.',
  },
  shipmentInTransit: {
    label: 'Shipment In Transit',
    description: 'When your shipment is picked up and in transit.',
  },
  shipmentDelivered: {
    label: 'Shipment Delivered',
    description: 'When your shipment is delivered.',
  },
  shipmentCompleted: {
    label: 'Shipment Completed',
    description: 'When a delivery is confirmed and the shipment is completed.',
  },
  shipmentCancelled: {
    label: 'Shipment Cancelled',
    description: 'When a shipment is cancelled.',
  },
  shipmentDisputed: {
    label: 'Dispute Opened',
    description: 'When a dispute is raised on a shipment.',
  },
  disputeResolved: {
    label: 'Dispute Resolved',
    description: 'When a dispute is resolved.',
  },
};

/** Stable, display order of the preference toggles. */
export const NOTIFICATION_PREFERENCE_KEYS = Object.keys(
  PREFERENCE_META,
) as NotificationPreferenceKey[];

/** Adapt the backend entity into an ordered, display-ready list for the UI. */
export function toPreferenceList(
  res: NotificationPreferencesResponse,
): NotificationPreference[] {
  return NOTIFICATION_PREFERENCE_KEYS.map((type) => ({
    type,
    label: PREFERENCE_META[type].label,
    description: PREFERENCE_META[type].description,
    enabled: Boolean(res[type]),
  }));
}

/** Default list used when preferences cannot be loaded (all channels on). */
export function defaultPreferenceList(): NotificationPreference[] {
  return NOTIFICATION_PREFERENCE_KEYS.map((type) => ({
    type,
    label: PREFERENCE_META[type].label,
    description: PREFERENCE_META[type].description,
    enabled: true,
  }));
}

export const notificationsApi = {
  getPreferences: async (): Promise<NotificationPreference[]> => {
    const res = await apiClient<NotificationPreferencesResponse>(
      '/notifications/preferences',
    );
    return toPreferenceList(res);
  },

  updatePreferences: (
    patch: NotificationPreferencesPatch,
  ): Promise<NotificationPreferencesResponse> =>
    apiClient<NotificationPreferencesResponse>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
};
