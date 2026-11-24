'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';

const DISMISS_KEY = 'onboarding_checklist_dismissed';

// Use lowercase role strings that match the backend UserRole enum.
type UserRole = 'shipper' | 'carrier';

interface UserProfile {
  role: UserRole;
  emailVerified: boolean;
  profileComplete: boolean;
  hasShipment: boolean;
  hasDocument: boolean;
  hasRoutePreferences: boolean;
  hasCertifications: boolean;
  hasAcceptedShipment: boolean;
}

const SHIPPER_STEPS = [
  { key: 'emailVerified', label: 'Verify email', href: '/profile' },
  { key: 'profileComplete', label: 'Complete profile', href: '/profile' },
  { key: 'hasShipment', label: 'Create first shipment', href: '/shipments/new' },
  { key: 'hasDocument', label: 'Upload a document', href: '/shipments' },
] as const;

const CARRIER_STEPS = [
  { key: 'emailVerified', label: 'Verify email', href: '/profile' },
  { key: 'hasRoutePreferences', label: 'Add route preferences', href: '/settings' },
  {
    key: 'hasCertifications',
    label: 'Upload certifications',
    href: '/carrier/certifications',
  },
  { key: 'hasAcceptedShipment', label: 'Accept first shipment', href: '/marketplace' },
] as const;

export default function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === 'true');
  }, []);

  const {
    data: profile,
    isError,
    error,
  } = useQuery({
    queryKey: ['onboarding-profile'],
    queryFn: () => apiClient<UserProfile>('/users/me/onboarding'),
    // Do not throw on 404 — the endpoint may not exist yet.
    retry: false,
  });

  // Show nothing while loading or if the endpoint is unavailable.
  // Log errors so they appear in the browser console for debugging.
  if (isError) {
    console.error('[OnboardingChecklist] Failed to load profile:', error);
    return null;
  }

  if (dismissed || !profile) return null;

  // Compare role in lowercase to match the backend UserRole enum values.
  const steps = profile.role === 'carrier' ? CARRIER_STEPS : SHIPPER_STEPS;
  const completed = steps.filter((s) => profile[s.key]).length;

  if (completed === steps.length) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm" role="region" aria-label="Onboarding checklist">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Get started — {completed}/{steps.length} complete</h2>
        <button onClick={dismiss} aria-label="Dismiss checklist" className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <div className="mb-3 h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all"
          style={{ width: `${(completed / steps.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemax={steps.length}
        />
      </div>
      <ul className="space-y-1">
        {steps.map((step) => (
          <li key={step.key} className="flex items-center gap-2 text-sm">
            <span className={profile[step.key] ? 'text-green-500' : 'text-gray-300'}>
              {profile[step.key] ? '✓' : '○'}
            </span>
            <Link
              href={step.href}
              className={profile[step.key] ? 'text-gray-400 line-through' : 'text-gray-700 hover:underline'}
            >
              {step.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
