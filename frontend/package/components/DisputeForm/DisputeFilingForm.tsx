'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';

const DISPUTE_REASONS = [
  { value: 'CARGO_DAMAGED', label: 'Cargo Damaged' },
  { value: 'NON_DELIVERY', label: 'Non-Delivery' },
  { value: 'LATE_DELIVERY', label: 'Late Delivery' },
  { value: 'PAYMENT_DISPUTE', label: 'Payment Dispute' },
  { value: 'OTHER', label: 'Other' },
] as const;

const disputeSchema = z.object({
  reason: z.string().min(1, 'Please select a reason'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
});

type DisputeFormData = z.infer<typeof disputeSchema>;

export interface DisputeFilingFormProps {
  shipmentId: string;
  shipmentStatus?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function DisputeFilingForm({
  shipmentId,
  shipmentStatus,
  onSuccess,
  onClose,
}: DisputeFilingFormProps) {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canFile =
    shipmentStatus === 'delivered' || shipmentStatus === 'in_transit';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema),
  });

  const description = watch('description', '');
  const selectedReason = watch('reason', '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((f) => {
      const isValidType = ['application/pdf', 'image/png', 'image/jpeg'].includes(f.type);
      const isValidSize = f.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    if (validFiles.length !== selectedFiles.length) {
      toast.error('Some files were rejected. Only PDF/PNG/JPG under 5MB allowed.');
    }
    setFiles((prev) => [...prev, ...validFiles].slice(0, 3));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: DisputeFormData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('reason', data.reason);
      formData.append('description', data.description);
      files.forEach((f) => formData.append('evidence', f));

      await apiClient(`/disputes`, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      toast.success('Dispute filed successfully. You will be notified of the resolution.');
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Failed to file dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canFile && shipmentStatus) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Disputes can only be filed for shipments that are{' '}
            <span className="font-medium">In Transit</span> or{' '}
            <span className="font-medium">Delivered</span>.
          </p>
          {onClose && (
            <Button variant="outline" size="sm" className="mt-3" onClick={onClose}>
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">File a Dispute</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(() => setStep('review'))}>
          {step === 'form' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason *</Label>
                <select
                  id="reason"
                  className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground"
                  {...register('reason')}
                >
                  <option value="">Select a reason...</option>
                  {DISPUTE_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {errors.reason && (
                  <p className="text-xs text-destructive">{errors.reason.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the issue in detail (minimum 50 characters)..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  {...register('description')}
                />
                <div className="flex justify-between">
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {description.length} / 50 min
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Evidence (optional, max 3 files)</Label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {files.length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {files.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1"
                      >
                        <span className="truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-destructive hover:text-destructive/80 ml-2"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-muted-foreground">
                  PDF, PNG, or JPG. Max 5MB each.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {onClose && (
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                )}
                <Button type="submit">Review Dispute →</Button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="text-sm font-medium">
                    {DISPUTE_REASONS.find((r) => r.value === selectedReason)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{description}</p>
                </div>
                {files.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Evidence Files</p>
                    <p className="text-sm">{files.length} file(s) attached</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('form')}
                >
                  ← Edit
                </Button>
                <div className="flex gap-2">
                  {onClose && (
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={submitting}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {submitting ? 'Submitting...' : 'Submit Dispute'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
