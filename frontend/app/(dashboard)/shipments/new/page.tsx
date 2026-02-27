'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';

const schema = z.object({
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
  cargoDescription: z.string().min(10, 'Please describe the cargo (min 10 chars)'),
  weightKg: z.coerce.number().positive('Weight must be positive'),
  volumeCbm: z.coerce.number().positive().optional().or(z.literal('')),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().length(3).default('USD'),
  notes: z.string().max(2000).optional(),
  pickupDate: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export default function NewShipmentPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD' },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        volumeCbm: data.volumeCbm === '' ? undefined : Number(data.volumeCbm),
      };
      const shipment = await shipmentApi.create(payload);
      toast.success('Shipment created!');
      router.push(`/shipments/${shipment.id}`);
    } catch {
      toast.error('Failed to create shipment. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create Shipment</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Post a new shipment for carriers to accept.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Route */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Route</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="origin">Origin *</Label>
              <Input
                id="origin"
                placeholder="Lagos, Nigeria"
                {...register('origin')}
              />
              {errors.origin && (
                <p className="text-xs text-destructive">{errors.origin.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                placeholder="Abuja, Nigeria"
                {...register('destination')}
              />
              {errors.destination && (
                <p className="text-xs text-destructive">{errors.destination.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cargo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cargo Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cargoDescription">Description *</Label>
              <textarea
                id="cargoDescription"
                rows={3}
                placeholder="Describe the cargo contents, handling requirements, etc."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                {...register('cargoDescription')}
              />
              {errors.cargoDescription && (
                <p className="text-xs text-destructive">{errors.cargoDescription.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="weightKg">Weight (kg) *</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.01"
                  placeholder="500"
                  {...register('weightKg')}
                />
                {errors.weightKg && (
                  <p className="text-xs text-destructive">{errors.weightKg.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="volumeCbm">Volume (m³) — optional</Label>
                <Input
                  id="volumeCbm"
                  type="number"
                  step="0.001"
                  placeholder="2.5"
                  {...register('volumeCbm')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
            <CardDescription>Set the quoted price for this shipment</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="1500.00"
                {...register('price')}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="USD" maxLength={3} {...register('currency')} />
            </div>
          </CardContent>
        </Card>

        {/* Dates & Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Input id="pickupDate" type="datetime-local" {...register('pickupDate')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estimatedDeliveryDate">Estimated Delivery</Label>
                <Input
                  id="estimatedDeliveryDate"
                  type="datetime-local"
                  {...register('estimatedDeliveryDate')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Any special instructions for the carrier..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                {...register('notes')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Shipment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
