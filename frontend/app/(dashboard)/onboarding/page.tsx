'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { addressesApi } from '../../../lib/api/addresses.api';

const ONBOARDING_KEY = 'ff_onboarding_progress';

interface OnboardingProgress {
  step: number;
  completed: boolean;
  data: Record<string, string>;
}

function loadProgress(): OnboardingProgress {
  if (typeof window === 'undefined') return { step: 1, completed: false, data: {} };
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    return stored ? JSON.parse(stored) : { step: 1, completed: false, data: {} };
  } catch {
    return { step: 1, completed: false, data: {} };
  }
}

function saveProgress(progress: OnboardingProgress) {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(progress));
}

const SHIPPER_STEPS = [
  { label: 'Welcome', description: 'Confirm your role' },
  { label: 'Company', description: 'Your business details' },
  { label: 'First Address', description: 'Default pickup location' },
];

const CARRIER_STEPS = [
  { label: 'Welcome', description: 'Confirm your role' },
  { label: 'Business', description: 'Your carrier details' },
  { label: 'Service Areas', description: 'Where you operate' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role ?? 'shipper';
  const steps = role === 'carrier' ? CARRIER_STEPS : SHIPPER_STEPS;

  const [progress, setProgress] = useState<OnboardingProgress>(() => {
    const stored = loadProgress();
    return stored.completed ? { step: 1, completed: false, data: {} } : stored;
  });

  const [formData, setFormData] = useState<Record<string, string>>(progress.data);

  const updateStep = (step: number, data?: Record<string, string>) => {
    const next = { ...progress, step, data: { ...formData, ...data } };
    setProgress(next);
    setFormData(next.data);
    saveProgress(next);
  };

  const finish = async () => {
    if (role === 'shipper') {
      const address = formData.address;
      if (address?.trim()) {
        const [line, city, country] = address.split(',').map((p) => p.trim());
        try {
          await addressesApi.create({
            label: 'Default Pickup',
            address: line || address,
            city: city || 'Unknown',
            country: country || 'Unknown',
            isDefault: true,
          });
        } catch {
          // Address save is best-effort
        }
      }
    }

    saveProgress({ step: 1, completed: true, data: {} });
    localStorage.setItem('ff_onboarding_done', 'true');
    router.replace('/dashboard');
  };

  const skip = () => finish();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`h-2 flex-1 rounded-full transition-colors ${i + 1 <= progress.step ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          ))}
          <span className="text-xs text-muted-foreground whitespace-nowrap">Step {progress.step} of {steps.length}</span>
        </div>

        {/* Step 1: Welcome */}
        {progress.step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to FreightFlow!</CardTitle>
              <CardDescription>
                You&apos;re registered as a <span className="font-semibold capitalize">{role}</span>.
                {role === 'shipper'
                  ? ' Post freight jobs and get bids from verified carriers.'
                  : ' Browse the marketplace and accept shipment jobs.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${role === 'shipper' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <p className="font-semibold">📦 Shipper</p>
                <p className="text-sm text-muted-foreground mt-1">Post freight jobs, receive bids, and track cargo end-to-end.</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${role === 'carrier' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <p className="font-semibold">🚛 Carrier</p>
                <p className="text-sm text-muted-foreground mt-1">Browse the marketplace, accept jobs, and build your reputation.</p>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={skip}>Skip setup</Button>
                <Button onClick={() => updateStep(2)}>Continue →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Role-specific */}
        {progress.step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{role === 'shipper' ? 'Company Details' : 'Business Details'}</CardTitle>
              <CardDescription>
                {role === 'shipper'
                  ? 'Tell us about your business to help carriers know you.'
                  : 'Tell shippers about your business and fleet.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Logistics"
                  value={formData.companyName ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
              {role === 'carrier' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="fleetSize">Fleet size</Label>
                    <Input
                      id="fleetSize"
                      placeholder="e.g. 5 trucks"
                      value={formData.fleetSize ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fleetSize: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      placeholder="e.g. Perishables, General Cargo"
                      value={formData.specialization ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, specialization: e.target.value }))}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={skip}>Skip</Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateStep(1)}>← Back</Button>
                  <Button onClick={() => updateStep(3)}>Continue →</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Final */}
        {progress.step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>{role === 'shipper' ? 'Default Pickup Address' : 'Service Areas'}</CardTitle>
              <CardDescription>
                {role === 'shipper'
                  ? 'Add a default address to speed up shipment creation.'
                  : 'Tell shippers which routes you cover.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {role === 'shipper' ? (
                <div className="space-y-1">
                  <Label htmlFor="address">Default Pickup Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, New York, NY 10001"
                    value={formData.address ?? ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <Label htmlFor="serviceAreas">Service areas</Label>
                  <Input
                    id="serviceAreas"
                    placeholder="e.g. Lagos, Abuja, Port Harcourt"
                    value={formData.serviceAreas ?? ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, serviceAreas: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple areas with commas.</p>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={skip}>Skip</Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateStep(2)}>← Back</Button>
                  <Button onClick={finish}>Go to Dashboard →</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
