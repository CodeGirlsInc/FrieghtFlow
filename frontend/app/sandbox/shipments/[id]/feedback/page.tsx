'use client';

import { use } from 'react';
import { ShipmentFeedback } from '../../../components/ShipmentFeedback';
import type { FeedbackData } from '../../../components/ShipmentFeedback';

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  function handleSuccess(data: FeedbackData) {
    console.log('Feedback submitted:', data);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Shipment Feedback</h1>
        <p className="mb-6 text-sm text-gray-500">Help us improve by rating your carrier experience.</p>
        <ShipmentFeedback
          shipmentId={id}
          carrierId="carrier-demo-001"
          onSuccess={handleSuccess}
        />
      </div>
    </main>
  );
}
