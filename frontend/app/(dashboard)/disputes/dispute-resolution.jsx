"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Check,
  CreditCard,
  DollarSign,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";

export default function DisputeResolution({ dispute, onResolve }) {
  const [resolutionType, setResolutionType] = useState("credit");
  const [amount, setAmount] = useState(dispute.amount.disputed || 0);
  const [description, setDescription] = useState("");

  const handleResolve = () => {
    onResolve({
      type: resolutionType,
      amount: Number.parseFloat(amount),
      description,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (dispute.status === "resolved" && dispute.resolution) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-full">
            <Check className="h-5 w-5 text-green-800" />
          </div>
          <h3 className="font-medium">Dispute Resolved</h3>
        </div>

        <div className="bg-muted p-6 rounded-md">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="font-medium">Resolution Type</div>
              <div className="font-bold">
                {dispute.resolution.type === "credit" && "Credit/Refund"}
                {dispute.resolution.type === "replacement" && "Replacement"}
                {dispute.resolution.type === "denied" && "Claim Denied"}
                {dispute.resolution.type === "other" && "Other Resolution"}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="font-medium">Resolution Date</div>
              <div>{formatDate(dispute.resolution.date)}</div>
            </div>

            <Separator />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="font-medium">Resolved By</div>
              <div>{dispute.resolution.resolvedBy}</div>
            </div>

            {dispute.resolution.amount > 0 && (
              <>
                <Separator />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="font-medium">Amount</div>
                  <div className="font-bold">
                    {dispute.amount.currency}{" "}
                    {dispute.resolution.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </>
            )}

            {dispute.resolution.description && (
              <>
                <Separator />

                <div className="space-y-2">
                  <div className="font-medium">Resolution Notes</div>
                  <div className="bg-background p-3 rounded-md">
                    {dispute.resolution.description}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onResolve(null)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reopen Dispute
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-medium">Resolve Dispute</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`border rounded-md p-4 cursor-pointer ${
            resolutionType === "credit" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => setResolutionType("credit")}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                resolutionType === "credit" ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <CreditCard
                className={`h-5 w-5 ${
                  resolutionType === "credit" ? "text-primary" : "text-subText"
                }`}
              />
            </div>
            <div>
              <h4 className="font-medium">Credit/Refund</h4>
              <p className="text-sm text-subText">
                Issue a credit or refund to the customer
              </p>
            </div>
          </div>
        </div>

        <div
          className={`border rounded-md p-4 cursor-pointer ${
            resolutionType === "replacement"
              ? "border-primary bg-primary/5"
              : ""
          }`}
          onClick={() => setResolutionType("replacement")}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                resolutionType === "replacement" ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  resolutionType === "replacement"
                    ? "text-primary"
                    : "text-subText"
                }`}
              />
            </div>
            <div>
              <h4 className="font-medium">Replacement</h4>
              <p className="text-sm text-subText">
                Send a replacement for damaged or missing items
              </p>
            </div>
          </div>
        </div>

        <div
          className={`border rounded-md p-4 cursor-pointer ${
            resolutionType === "denied" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => setResolutionType("denied")}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                resolutionType === "denied" ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <X
                className={`h-5 w-5 ${
                  resolutionType === "denied" ? "text-primary" : "text-subText"
                }`}
              />
            </div>
            <div>
              <h4 className="font-medium">Deny Claim</h4>
              <p className="text-sm text-subText">
                Deny the dispute claim with explanation
              </p>
            </div>
          </div>
        </div>

        <div
          className={`border rounded-md p-4 cursor-pointer ${
            resolutionType === "other" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => setResolutionType("other")}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                resolutionType === "other" ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <FileText
                className={`h-5 w-5 ${
                  resolutionType === "other" ? "text-primary" : "text-subText"
                }`}
              />
            </div>
            <div>
              <h4 className="font-medium">Other Resolution</h4>
              <p className="text-sm text-subText">
                Custom resolution not listed above
              </p>
            </div>
          </div>
        </div>
      </div>

      {(resolutionType === "credit" || resolutionType === "replacement") && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-subText" />
              <Input
                id="amount"
                type="number"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Resolution Notes</Label>
        <textarea
          id="description"
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Provide details about the resolution..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Important Note</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Resolving this dispute will change its status to "Resolved" and
              notify the customer. This action cannot be easily undone.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleResolve}>
          <Check className="mr-2 h-4 w-4" />
          Resolve Dispute
        </Button>
      </div>
    </div>
  );
}
