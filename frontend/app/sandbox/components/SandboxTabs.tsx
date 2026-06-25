'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShipmentStepper } from './ShipmentStepper';
import type { ShipmentStep } from './ShipmentStepper';
import { QuoteTableDemo } from './QuoteTableDemo';
import type { CarrierQuote } from './QuoteComparisonTable';
import { DocumentChecklistDemo } from './DocumentChecklistDemo';
import type { ShipmentDocument } from './DocumentChecklist';
import { CostBreakdownChart } from './CostBreakdownChart';
import type { CostItem } from './CostBreakdownChart';

interface StepperDemo {
  title: string;
  shipmentId: string;
  origin: string;
  destination: string;
  currentStatus: ShipmentStep;
  timestamps: { [key in ShipmentStep]?: string | null };
}

interface ChecklistDemo {
  title: string;
  initialDocuments: ShipmentDocument[];
}

interface CostDemo {
  title: string;
  breakdown: CostItem[];
  currency?: string;
}

interface SandboxTabsProps {
  stepperDemos: StepperDemo[];
  quotes: CarrierQuote[];
  checklistDemos: ChecklistDemo[];
  costDemos: CostDemo[];
}

const TABS = [
  { id: 'stepper',   label: 'Shipment Timeline'    },
  { id: 'quotes',    label: 'Quote Comparison'      },
  { id: 'documents', label: 'Document Checklist'    },
  { id: 'cost',      label: 'Cost Breakdown'        },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function SandboxTabs({ stepperDemos, quotes, checklistDemos, costDemos }: SandboxTabsProps) {
  const [active, setActive] = useState<TabId>('stepper');

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition-colors focus:outline-none',
                active === tab.id
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-600',
              )}
            >
              {tab.label}
              {active === tab.id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gray-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      <div className="mt-8">
        {active === 'stepper' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stepperDemos.map((demo) => (
              <div
                key={demo.shipmentId}
                className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {demo.title}
                    </span>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">
                      {demo.shipmentId}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <span className="font-medium text-gray-700">{demo.origin}</span>
                    <span className="text-gray-300">→</span>
                    <span className="font-medium text-gray-700">{demo.destination}</span>
                  </div>
                </div>
                <div className="px-5 py-5">
                  <ShipmentStepper
                    currentStatus={demo.currentStatus}
                    timestamps={demo.timestamps}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {active === 'quotes' && (
          <QuoteTableDemo quotes={quotes} />
        )}

        {active === 'documents' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {checklistDemos.map((demo) => (
              <DocumentChecklistDemo
                key={demo.title}
                title={demo.title}
                initialDocuments={demo.initialDocuments}
              />
            ))}
          </div>
        )}

        {active === 'cost' && (
          <div className="grid gap-6 sm:grid-cols-2">
            {costDemos.map((demo) => (
              <div key={demo.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  {demo.title}
                </h3>
                <CostBreakdownChart breakdown={demo.breakdown} currency={demo.currency} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
