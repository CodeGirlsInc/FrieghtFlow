"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  Receipt,
} from "lucide-react";

export default function BillingHeader({ billingData, updateBillingData }) {
  const [isAutoRenewDialogOpen, setIsAutoRenewDialogOpen] = useState(false);

  const getPlanName = (plan) => {
    switch (plan) {
      case "starter":
        return "Starter Plan";
      case "professional":
        return "Professional Plan";
      case "enterprise":
        return "Enterprise Plan";
      default:
        return "Unknown Plan";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Past Due
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Canceled
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const toggleAutoRenew = () => {
    updateBillingData({ autoRenew: !billingData.autoRenew });
    setIsAutoRenewDialogOpen(false);
  };

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-headerText">
                Billing & Subscription
              </h1>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Current Plan:</span>
                <span className="font-bold">
                  {getPlanName(billingData.currentPlan)}
                </span>
                {getStatusBadge(billingData.status)}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Billing Cycle:</span>
                <span>
                  {billingData.billingCycle === "monthly"
                    ? "Monthly"
                    : "Annually"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-subText" />
                <span className="font-medium">Next Billing:</span>
                <span>{billingData.nextBillingDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Auto-renew:</span>
              <Dialog
                open={isAutoRenewDialogOpen}
                onOpenChange={setIsAutoRenewDialogOpen}
              >
                <DialogTrigger asChild>
                  <Switch checked={billingData.autoRenew} />
                </DialogTrigger>
                {!billingData.autoRenew && (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enable Auto-renewal?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p>
                        By enabling auto-renewal, your subscription will
                        automatically renew at the end of your billing period.
                        This ensures uninterrupted access to all FreightFlow
                        services.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={toggleAutoRenew}>
                        Enable Auto-renewal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                )}
                {billingData.autoRenew && (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Disable Auto-renewal?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p>
                        If you disable auto-renewal, your subscription will end
                        on {billingData.currentPeriodEnd}. After this date,
                        you'll lose access to FreightFlow services unless you
                        manually renew.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={toggleAutoRenew}>
                        Disable Auto-renewal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                )}
              </Dialog>
            </div>

            <div className="flex gap-2 mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Billing Documents
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Receipt className="mr-2 h-4 w-4" />
                    <span>Latest Invoice</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download Statement</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Payment Receipt</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button>Manage Subscription</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
