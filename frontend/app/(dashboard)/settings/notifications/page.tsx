'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import {
  notificationsApi,
  defaultPreferenceList,
  NotificationPreference,
  NotificationPreferenceKey,
} from '../../../../lib/api/notifications.api';

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    notificationsApi
      .getPreferences()
      .then(setPrefs)
      .catch(() => setPrefs(defaultPreferenceList()))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = useCallback(
    async (type: NotificationPreferenceKey, enabled: boolean) => {
      setPrefs((prev) =>
        prev.map((p) => (p.type === type ? { ...p, enabled } : p)),
      );
      setSaving(type);
      try {
        await notificationsApi.updatePreferences({ [type]: enabled });
        toast.success('Preference saved');
      } catch {
        // revert
        setPrefs((prev) =>
          prev.map((p) => (p.type === type ? { ...p, enabled: !enabled } : p)),
        );
        toast.error('Failed to save preference');
      } finally {
        setSaving(null);
      }
    },
    [],
  );

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notification Preferences</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Choose which email notifications you receive.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email notifications</CardTitle>
          <CardDescription>Toggle each notification type on or off.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <div className="space-y-1.5">
                    <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-64 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-6 w-10 rounded-full bg-muted animate-pulse" />
                </div>
              ))
            : prefs.map((pref) => (
                <div key={pref.type} className="flex items-center justify-between py-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={pref.enabled}
                    aria-label={`Toggle ${pref.label}`}
                    disabled={saving === pref.type}
                    onClick={() => handleToggle(pref.type, !pref.enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                      pref.enabled ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span
                      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                        pref.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
        </CardContent>
      </Card>
    </div>
  );
}
