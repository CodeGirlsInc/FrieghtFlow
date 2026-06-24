'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '../../../../../lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';

interface Dispute {
  id: string;
  shipmentId: string;
  reason: string;
  status: 'open' | 'resolved' | 'closed';
  evidenceUrls?: string[];
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<Dispute>(`/shipments/${id}/dispute`)
      .then(setDispute)
      .catch(() => toast.error('Failed to load dispute details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No dispute found for this shipment.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const statusColor =
    dispute.status === 'resolved'
      ? 'text-green-600'
      : dispute.status === 'closed'
        ? 'text-muted-foreground'
        : 'text-yellow-600';

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-xs text-muted-foreground hover:text-foreground mb-2 block"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-foreground">Dispute Details</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Shipment #{id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Dispute Reason</span>
            <span className={`text-sm font-medium capitalize ${statusColor}`}>
              {dispute.status}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground whitespace-pre-wrap">{dispute.reason}</p>
          <p className="text-xs text-muted-foreground">
            Filed on {new Date(dispute.createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submitted Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dispute.evidenceUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Evidence file {i + 1}
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {dispute.status === 'resolved' && dispute.resolutionNotes && (
        <Card className="border-green-500/30">
          <CardHeader>
            <CardTitle className="text-base text-green-600">Admin Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {dispute.resolutionNotes}
            </p>
            {dispute.resolvedAt && (
              <p className="text-xs text-muted-foreground">
                Resolved on {new Date(dispute.resolvedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
