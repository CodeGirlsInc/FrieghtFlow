import {
  toPreferenceList,
  defaultPreferenceList,
  NOTIFICATION_PREFERENCE_KEYS,
  notificationsApi,
  type NotificationPreferencesResponse,
} from './notifications.api';
import { apiClient } from './client';

jest.mock('./client');
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

/**
 * Mirrors the shape produced by backend/src/notification-preferences
 * (NotificationPreferences entity + UpdateNotificationPreferencesDto).
 */
const backendEntity: NotificationPreferencesResponse = {
  id: 'np-1',
  userId: 'u-1',
  shipmentAccepted: true,
  shipmentInTransit: false,
  shipmentDelivered: true,
  shipmentCompleted: false,
  shipmentCancelled: true,
  shipmentDisputed: false,
  disputeResolved: true,
  updatedAt: '2026-08-20T00:00:00.000Z',
};

describe('notifications.api adapter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('maps every backend entity flag onto a display row, preserving on/off state', () => {
    const list = toPreferenceList(backendEntity);

    expect(list.map((p) => p.type)).toEqual(NOTIFICATION_PREFERENCE_KEYS);
    expect(Object.fromEntries(list.map((p) => [p.type, p.enabled]))).toEqual({
      shipmentAccepted: true,
      shipmentInTransit: false,
      shipmentDelivered: true,
      shipmentCompleted: false,
      shipmentCancelled: true,
      shipmentDisputed: false,
      disputeResolved: true,
    });
    // Every row is display-ready.
    list.forEach((p) => {
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
    });
  });

  it('only references keys the backend UpdateNotificationPreferencesDto accepts', () => {
    const dtoKeys = [
      'shipmentAccepted',
      'shipmentInTransit',
      'shipmentDelivered',
      'shipmentCompleted',
      'shipmentCancelled',
      'shipmentDisputed',
      'disputeResolved',
    ].sort();
    expect([...NOTIFICATION_PREFERENCE_KEYS].sort()).toEqual(dtoKeys);
  });

  it('getPreferences() calls the backend endpoint and returns the adapted list', async () => {
    mockApiClient.mockResolvedValue(backendEntity);

    const list = await notificationsApi.getPreferences();

    expect(mockApiClient).toHaveBeenCalledWith('/notifications/preferences');
    expect(list).toEqual(toPreferenceList(backendEntity));
  });

  it('updatePreferences() PATCHes the endpoint with a camelCase key the backend understands', async () => {
    mockApiClient.mockResolvedValue({ ...backendEntity, shipmentInTransit: true });

    await notificationsApi.updatePreferences({ shipmentInTransit: true });

    expect(mockApiClient).toHaveBeenCalledWith('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ shipmentInTransit: true }),
    });
  });

  it('defaultPreferenceList() is a fully-enabled list in the canonical order', () => {
    const list = defaultPreferenceList();
    expect(list.map((p) => p.type)).toEqual(NOTIFICATION_PREFERENCE_KEYS);
    expect(list.every((p) => p.enabled)).toBe(true);
  });
});
