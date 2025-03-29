"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Check, CreditCard, HelpCircle, X } from "lucide-react";

export default function SubscriptionManagement({
  billingData,
  updateBillingData,
}) {
  const [isDowngradeDialogOpen, setIsDowngradeDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const plans = [
    {
      id: "starter",
      name: "Starter Plan",
      price: { monthly: 99, annually: 990 },
      description:
        "Perfect for small businesses just getting started with freight management.",
      features: [
        { name: "Up to 50 shipments/month", included: true },
        { name: "Up to 3 team members", included: true },
        { name: "1GB document storage", included: true },
        { name: "Standard support", included: true },
        { name: "Basic analytics", included: true },
        { name: "No integrations", included: false },
        { name: "Dedicated account manager", included: false },
        { name: "API access", included: false },
        { name: "White-labeling", included: false },
        { name: "SSO authentication", included: false },
      ],
    },
    {
      id: "professional",
      name: "Professional Plan",
      price: { monthly: 249, annually: 2490 },
      description:
        "Designed for growing businesses with moderate shipping needs.",
      features: [
        { name: "Up to 200 shipments/month", included: true },
        { name: "Up to 10 team members", included: true },
        { name: "5GB document storage", included: true },
        { name: "Priority support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Basic integrations", included: true },
        { name: "Dedicated account manager", included: false },
        { name: "API access (10,000 requests/month)", included: true },
        { name: "White-labeling", included: false },
        { name: "SSO authentication", included: false },
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: { monthly: 499, annually: 4990 },
      description: "For large organizations with complex shipping operations.",
      features: [
        { name: "Unlimited shipments", included: true },
        { name: "Up to 25 team members", included: true },
        { name: "10GB document storage", included: true },
        { name: "Priority support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom integrations", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "API access (50,000 requests/month)", included: true },
        { name: "White-labeling", included: true },
        { name: "SSO authentication", included: true },
      ],
    },
  ];

  const currentPlan =
    plans.find((plan) => plan.id === billingData.currentPlan) || plans[0];

  const handleUpgrade = (planId) => {
    updateBillingData({ currentPlan: planId });
    setIsUpgradeDialogOpen(false);
  };

  const handleDowngrade = (planId) => {
    updateBillingData({ currentPlan: planId });
    setIsDowngradeDialogOpen(false);
  };

  const handleCancel = () => {
    updateBillingData({
      status: "canceled",
      autoRenew: false,
    });
    setIsCancelDialogOpen(false);
  };

  const getAvailablePlans = () => {
    const currentPlanIndex = plans.findIndex(
      (plan) => plan.id === billingData.currentPlan
    );

    if (currentPlanIndex === 0) {
      // If on starter plan, can only upgrade
      return {
        upgradePlans: plans.slice(1),
        downgradePlans: [],
      };
    } else if (currentPlanIndex === plans.length - 1) {
      // If on enterprise plan, can only downgrade
      return {
        upgradePlans: [],
        downgradePlans: plans.slice(0, currentPlanIndex),
      };
    } else {
      // If on a middle plan, can upgrade or downgrade
      return {
        upgradePlans: plans.slice(currentPlanIndex + 1),
        downgradePlans: plans.slice(0, currentPlanIndex),
      };
    }
  };

  const { upgradePlans, downgradePlans } = getAvailablePlans();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Current Subscription</h3>
        <p className="text-sm text-subText mt-1">
          You are currently on the {currentPlan.name} with{" "}
          {billingData.billingCycle} billing.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h4 className="font-bold text-lg">{currentPlan.name}</h4>
              <p className="text-sm text-subText mt-1">
                {currentPlan.description}
              </p>
              <div className="flex items-baseline mt-3">
                <span className="text-2xl font-bold">
                  $
                  {billingData.billingCycle === "monthly"
                    ? currentPlan.price.monthly
                    : currentPlan.price.annually}
                </span>
                <span className="text-subText ml-1">
                  /{billingData.billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Badge className="self-start bg-green-100 text-green-800 border-green-200">
                Current Plan
              </Badge>

              <div className="flex flex-wrap gap-2 mt-2">
                {billingData.status !== "canceled" && (
                  <Dialog
                    open={isCancelDialogOpen}
                    onOpenChange={setIsCancelDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Cancel Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Your Subscription?</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <p>
                          Are you sure you want to cancel your subscription?
                          You'll lose access to the following features:
                        </p>
                        <ul className="space-y-2">
                          {currentPlan.features
                            .filter((f) => f.included)
                            .map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                                <span>{feature.name}</span>
                              </li>
                            ))}
                        </ul>
                        <p className="text-sm text-subText">
                          Your subscription will remain active until the end of
                          your current billing period on{" "}
                          {billingData.currentPeriodEnd}.
                        </p>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">
                            Keep My Subscription
                          </Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleCancel}>
                          Cancel Subscription
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {billingData.billingCycle === "monthly" && (
                  <Button variant="outline" size="sm">
                    Switch to Annual Billing
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {upgradePlans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upgrade Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upgradePlans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold">{plan.name}</h4>
                      <p className="text-sm text-subText mt-1">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline mt-3">
                        <span className="text-xl font-bold">
                          $
                          {billingData.billingCycle === "monthly"
                            ? plan.price.monthly
                            : plan.price.annually}
                        </span>
                        <span className="text-subText ml-1">
                          /
                          {billingData.billingCycle === "monthly"
                            ? "month"
                            : "year"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plan.features.slice(0, 5).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>

                    <Dialog
                      open={isUpgradeDialogOpen}
                      onOpenChange={setIsUpgradeDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full">Upgrade</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upgrade to {plan.name}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <p>
                            You're about to upgrade from {currentPlan.name} to{" "}
                            {plan.name}.
                          </p>
                          <div className="space-y-2">
                            <h4 className="font-medium">New billing amount:</h4>
                            <div className="flex items-center gap-2 p-3 bg-inputBackground rounded-md">
                              <CreditCard className="h-5 w-5 text-subText" />
                              <div>
                                <p className="font-medium">
                                  $
                                  {billingData.billingCycle === "monthly"
                                    ? plan.price.monthly
                                    : plan.price.annually}
                                  /
                                  {billingData.billingCycle === "monthly"
                                    ? "month"
                                    : "year"}
                                </p>
                                <p className="text-sm text-subText">
                                  Next billing date:{" "}
                                  {billingData.nextBillingDate}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-subText">
                            Your plan will be upgraded immediately. You'll be
                            charged a prorated amount for the remainder of your
                            current billing period.
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button onClick={() => handleUpgrade(plan.id)}>
                            Confirm Upgrade
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {downgradePlans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Downgrade Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downgradePlans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold">{plan.name}</h4>
                      <p className="text-sm text-subText mt-1">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline mt-3">
                        <span className="text-xl font-bold">
                          $
                          {billingData.billingCycle === "monthly"
                            ? plan.price.monthly
                            : plan.price.annually}
                        </span>
                        <span className="text-subText ml-1">
                          /
                          {billingData.billingCycle === "monthly"
                            ? "month"
                            : "year"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plan.features.slice(0, 5).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>

                    <Dialog
                      open={isDowngradeDialogOpen}
                      onOpenChange={setIsDowngradeDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Downgrade
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Downgrade to {plan.name}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <p>
                            You're about to downgrade from {currentPlan.name} to{" "}
                            {plan.name}.
                          </p>
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              Features you'll lose:
                            </h4>
                            <ul className="space-y-2">
                              {currentPlan.features
                                .filter(
                                  (f) =>
                                    f.included &&
                                    !plan.features.find(
                                      (pf) => pf.name === f.name && pf.included
                                    )
                                )
                                .map((feature, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                    <span>{feature.name}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                          <p className="text-sm text-subText">
                            Your plan will be downgraded at the end of your
                            current billing period on{" "}
                            {billingData.currentPeriodEnd}. No refunds will be
                            issued for the current billing period.
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            onClick={() => handleDowngrade(plan.id)}
                          >
                            Confirm Downgrade
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-subText">
        <HelpCircle className="h-4 w-4" />
        <p>
          Need a custom plan?{" "}
          <Button variant="link" className="h-auto p-0">
            Contact our sales team
          </Button>
        </p>
      </div>
    </div>
  );
}
