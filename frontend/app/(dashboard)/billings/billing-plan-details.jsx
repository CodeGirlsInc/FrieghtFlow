import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Check, Clock, CreditCard, HelpCircle } from "lucide-react";

export default function BillingPlanDetails({ billingData }) {
  const getPlanFeatures = (plan) => {
    switch (plan) {
      case "enterprise":
        return [
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
        ];
      case "professional":
        return [
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
        ];
      case "starter":
        return [
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
        ];
      default:
        return [];
    }
  };

  const getPlanPrice = (plan, cycle) => {
    const prices = {
      starter: { monthly: 99, annually: 990 },
      professional: { monthly: 249, annually: 2490 },
      enterprise: { monthly: 499, annually: 4990 },
    };

    return prices[plan] ? prices[plan][cycle] : 0;
  };

  const features = getPlanFeatures(billingData.currentPlan);
  const price = getPlanPrice(billingData.currentPlan, billingData.billingCycle);
  const annualSavings =
    billingData.billingCycle === "monthly"
      ? Math.round(
          getPlanPrice(billingData.currentPlan, "monthly") * 12 -
            getPlanPrice(billingData.currentPlan, "annually")
        )
      : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          Current Plan Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">
                {billingData.currentPlan === "enterprise"
                  ? "Enterprise Plan"
                  : billingData.currentPlan === "professional"
                  ? "Professional Plan"
                  : "Starter Plan"}
              </h3>
              <p className="text-sm text-subText mt-1">
                {billingData.billingCycle === "monthly"
                  ? "Billed monthly"
                  : "Billed annually"}
              </p>
            </div>

            <div className="flex items-baseline">
              <span className="text-3xl font-bold">${price}</span>
              <span className="text-subText ml-1">
                /{billingData.billingCycle === "monthly" ? "month" : "year"}
              </span>
            </div>

            {billingData.billingCycle === "monthly" && (
              <div className="flex items-center text-sm">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Save ${annualSavings}/year
                </Badge>
                <Button variant="link" className="h-auto p-0 ml-2">
                  Switch to annual billing
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-subText">
              <Clock className="h-4 w-4" />
              <span>
                Current period: {billingData.currentPeriodStart} -{" "}
                {billingData.currentPeriodEnd}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-subText" />
              <span>
                Next billing: {billingData.nextBillingDate} •{" "}
                {billingData.amount} {billingData.currency}
              </span>
            </div>
          </div>

          <div className="space-y-3 min-w-[200px]">
            <h4 className="font-medium">Usage Summary</h4>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Shipments</span>
                <span className="font-medium">
                  {billingData.usage.shipments.used}/
                  {billingData.usage.shipments.limit}
                </span>
              </div>
              <Progress
                value={billingData.usage.shipments.percentage}
                className="h-2"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Storage</span>
                <span className="font-medium">
                  {billingData.usage.storage.used}GB/
                  {billingData.usage.storage.limit}GB
                </span>
              </div>
              <Progress
                value={billingData.usage.storage.percentage}
                className="h-2"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Team Members</span>
                <span className="font-medium">
                  {billingData.usage.users.used}/{billingData.usage.users.limit}
                </span>
              </div>
              <Progress
                value={billingData.usage.users.percentage}
                className="h-2"
              />
            </div>

            <Button variant="outline" size="sm" className="w-full mt-2">
              View Detailed Usage
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Plan Features</h4>
            <Button variant="link" className="h-auto p-0">
              Compare Plans <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                {feature.included ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-gray-300" />
                )}
                <span className={feature.included ? "" : "text-subText"}>
                  {feature.name}
                </span>
                {feature.name.includes("API") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                  >
                    <HelpCircle className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
