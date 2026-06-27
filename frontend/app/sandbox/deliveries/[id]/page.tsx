'use client';

import { useState } from 'react';
import { ProofOfDelivery, type PODSubmission } from '../../components/ProofOfDelivery';

export default function DeliveryPODPage() {
  const [submitted, setSubmitted] = useState<PODSubmission | null>(null);

  if (submitted) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center space-y-3">
          <div className="text-4xl">✅</div>
          <h1 className="text-xl font-bold text-green-800">Proof of Delivery Submitted</h1>
          <p className="text-sm text-green-700">Photo and signature have been recorded.</p>
          <button
            onClick={() => setSubmitted(null)}
            className="mt-4 rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Submit Another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Proof of Delivery</h1>
      <ProofOfDelivery onSubmit={setSubmitted} />
    </main>
  );
}
