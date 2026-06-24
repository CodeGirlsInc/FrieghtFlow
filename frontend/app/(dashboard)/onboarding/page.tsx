'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

const ONBOARDING_KEY = 'ff_onboarding_done';

const FEATURE_HIGHLIGHTS = [
  { icon: '📦', title: 'Create Shipments', desc: 'Post freight jobs and get bids from verified carriers.' },
  { icon: '🗺️', title: 'Track in Real-Time', desc: 'Follow every shipment through its lifecycle with live updates.' },
  { icon: '🔒', title: 'Blockchain Audit Trail', desc: 'Every status change is recorded on-chain for full transparency.' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [routePrefs, setRoutePrefs] = useState('');

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/dashboard');
  };

  const skip = () => finish();

  const role = user?.role ?? 'shipper';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          ))}
          <span className="text-xs text-muted-foreground whitespace-nowrap">Step {step} of 3</span>
        </div>

        {/* Step 1: Confirm role */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to FreightFlow!</CardTitle>
              <CardDescription>You&apos;re registered as a <span className="font-semibold capitalize">{role}</span>. Here&apos;s what that means:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${role === 'shipper' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <p className="font-semibold">📦 Shipper</p>
                <p className="text-sm text-muted-foreground mt-1">Post freight jobs, receive bids from carriers, and track your cargo end-to-end.</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${role === 'carrier' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <p className="font-semibold">🚛 Carrier</p>
                <p className="text-sm text-muted-foreground mt-1">Browse the marketplace, accept shipment jobs, and build your reputation with reviews.</p>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={skip}>Skip setup</Button>
                <Button onClick={() => setStep(2)}>Continue →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Role-specific setup */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{role === 'shipper' ? 'Add Your First Address' : 'Set Route Preferences'}</CardTitle>
              <CardDescription>
                {role === 'shipper'
                  ? 'Add a default pickup address to speed up shipment creation.'
                  : 'Tell carriers which routes you prefer to operate on.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {role === 'shipper' ? (
                <div className="space-y-1">
                  <Label htmlFor="address">Default Pickup Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, New York, NY 10001"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <Label htmlFor="routes">Preferred Routes</Label>
                  <Input
                    id="routes"
                    placeholder="e.g. New York → Los Angeles, Chicago → Miami"
                    value={routePrefs}
                    onChange={(e) => setRoutePrefs(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple routes with commas.</p>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={skip}>Skip</Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>← Back</Button>
                  <Button onClick={() => setStep(3)}>Continue →</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Feature highlights */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>You&apos;re all set! 🎉</CardTitle>
              <CardDescription>Here are 3 things you can do right now:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {FEATURE_HIGHLIGHTS.map((f) => (
                <div key={f.title} className="flex gap-3 items-start">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>← Back</Button>
                <Button onClick={finish}>Go to Dashboard →</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
