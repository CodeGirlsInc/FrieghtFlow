'use client';

import { useState, useRef, useCallback } from 'react';

export interface PODSubmission {
  photoUrl: string;
  signatureDataUrl: string;
}

interface ProofOfDeliveryProps {
  onSubmit: (data: PODSubmission) => void;
}

type Step = 1 | 2 | 3;

export function ProofOfDelivery({ onSubmit }: ProofOfDeliveryProps) {
  const [step, setStep] = useState<Step>(1);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [drawing, setDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // ── Step 1: photo upload ──────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── Step 2: signature pad ─────────────────────────────────────────
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(true);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || !lastPos.current) return;
      const pos = getPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      lastPos.current = pos;
    },
    [drawing],
  );

  const stopDraw = useCallback(() => setDrawing(false), []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  const captureSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignatureDataUrl(canvas.toDataURL());
    setStep(3);
  };

  const handleSubmit = () => {
    onSubmit({ photoUrl, signatureDataUrl });
  };

  // ── shared step header ────────────────────────────────────────────
  const steps = ['Upload Photo', 'Signature', 'Review & Submit'];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* progress */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => {
          const n = (i + 1) as Step;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  done
                    ? 'bg-green-500 text-white'
                    : active
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {done ? '✓' : n}
              </div>
              <span className="text-center text-xs text-gray-500">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Upload Delivery Photo</h2>
          {photoUrl ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="Delivery preview" className="w-full rounded-lg object-cover max-h-56" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 underline"
              >
                Replace photo
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 py-10 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
              </svg>
              <span className="text-sm">Camera capture or file upload</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
          <button
            disabled={!photoUrl}
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            Continue to Signature
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Recipient Signature</h2>
          <p className="text-sm text-gray-500">Ask the recipient to sign below.</p>
          <canvas
            ref={canvasRef}
            width={420}
            height={180}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <div className="flex gap-3">
            <button
              onClick={clearSignature}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={captureSignature}
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Capture & Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Review & Submit</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Photo</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="Delivery" className="w-full rounded-lg object-cover max-h-40 border border-gray-200" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Signature</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatureDataUrl} alt="Signature" className="w-full rounded-lg border border-gray-200 bg-gray-50 max-h-40 object-contain" />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Submit Proof of Delivery
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
