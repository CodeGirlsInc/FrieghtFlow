import { apiClient } from './client';

export interface NotificationPreference {
  type: string;
  label: string;
  description: string;
  enabled: boolean;
}

export const notificationsApi = {
  getPreferences: () =>
    apiClient<NotificationPreference[]>('/notifications/preferences'),

  updatePreferences: (prefs: Record<string, boolean>) =>
    apiClient<void>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    }),
};
