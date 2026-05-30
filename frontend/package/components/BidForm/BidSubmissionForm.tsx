'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR'];

const bidSchema = z.object({
  proposed_price: z.coerce.number().positive('Price must be a positive number'),
  currency: z.string().length(3, 'Select a currency'),
  message: z.string().max(500, 'Message must be under 500 characters').optional(),
});

type BidFormData = z.infer<typeof bidSchema>;

export interface BidSubmissionFormProps {
  shipmentId: string;
  hasAcceptedBid?: boolean;
  hasUserBid?: boolean;
  onSuccess?: () => void;
}

export function BidSubmissionForm({
  shipmentId,
  hasAcceptedBid = false,
  hasUserBid = false,
  onSuccess,
}: BidSubmissionFormProps) {
  const queryClient = useQueryClient();
  const isDisabled = hasAcceptedBid || hasUserBid;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: { currency: 'USD' },
  });

  const bidMutation = useMutation({
    mutationFn: (data: BidFormData) =>
      apiClient('/bids', {
        method: 'POST',
        body: JSON.stringify({ ...data, shipmentId }),
      }),
    onSuccess: () => {
      toast.success('Bid submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['bids', shipmentId] });
      reset();
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit bid. Please try again.');
    },
  });

  const onSubmit = (data: BidFormData) => {
    bidMutation.mutate(data);
  };

  if (hasAcceptedBid) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            This shipment already has an accepted bid.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (hasUserBid) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            You have already submitted a bid for this shipment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Submit a Bid</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="proposed_price">Proposed Price *</Label>
              <Input
                id="proposed_price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1500.00"
                disabled={isDisabled}
                {...register('proposed_price')}
              />
              {errors.proposed_price && (
                <p className="text-xs text-destructive">{errors.proposed_price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency *</Label>
              <select
                id="currency"
                disabled={isDisabled}
                className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground"
                {...register('currency')}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="text-xs text-destructive">{errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message (optional)</Label>
            <textarea
              id="message"
              rows={3}
              maxLength={500}
              placeholder="Add a note to the shipper..."
              disabled={isDisabled}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || bidMutation.isPending}
          >
            {bidMutation.isPending ? 'Submitting Bid...' : 'Submit Bid'}
          </Button>

          {bidMutation.isError && (
            <p className="text-xs text-destructive text-center">
              {bidMutation.error?.message || 'An error occurred. Please try again.'}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
