'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { apiClient } from '../../lib/api/client';

const schema = z.object({
  reason: z.string().min(10, 'Please describe the issue (min 10 characters)'),
});
type FormData = z.infer<typeof schema>;

interface Props {
  shipmentId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function DisputeForm({ shipmentId, onSuccess, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('reason', data.reason);
      const files = fileRef.current?.files;
      if (files) {
        Array.from(files).forEach((f) => formData.append('evidence', f));
      }

      await apiClient(`/shipments/${shipmentId}/dispute`, {
        method: 'POST',
        body: formData,
        // Let browser set Content-Type with boundary for multipart
        headers: {},
      });

      toast.success('Dispute filed successfully.');
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Failed to file dispute.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">File a Dispute</h2>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <textarea
              id="reason"
              rows={4}
              placeholder="Describe the issue in detail…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence (optional)</Label>
            <input
              id="evidence"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              ref={fileRef}
              aria-label="Upload evidence files"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="destructive" disabled={isSubmitting || uploading}>
              {isSubmitting || uploading ? 'Submitting…' : 'Submit Dispute'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
