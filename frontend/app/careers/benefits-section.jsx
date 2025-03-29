import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Plane,
  Home,
  DollarSign,
  Briefcase,
  Coffee,
  Smile,
  BookOpen,
  Users,
  Gift,
  Clock,
  Activity,
} from "lucide-react";

export default function BenefitsSection() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Benefits & Perks</h2>
        <p className="text-lg text-muted-foreground">
          We believe in taking care of our team members both inside and outside
          of work. Our comprehensive benefits package is designed to support
          your health, wealth, and well-being.
        </p>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="health">Health & Wellness</TabsTrigger>
          <TabsTrigger value="financial">Financial Benefits</TabsTrigger>
          <TabsTrigger value="time">Time Off</TabsTrigger>
          <TabsTrigger value="perks">Perks & Extras</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Comprehensive Health Insurance
                </h3>
                <p className="text-center text-muted-foreground">
                  We offer top-tier medical, dental, and vision insurance plans
                  with coverage for you and your dependents.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Wellness Programs
                </h3>
                <p className="text-center text-muted-foreground">
                  Access to fitness reimbursements, mental health resources, and
                  wellness challenges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Smile className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Mental Health Support
                </h3>
                <p className="text-center text-muted-foreground">
                  Free access to therapy sessions, meditation apps, and mental
                  health days.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 bg-muted p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">
              Additional Health Benefits
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span>
                  Health Savings Account (HSA) with employer contribution
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span>Flexible Spending Account (FSA) options</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span>Life and disability insurance</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span>Accident and critical illness coverage</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span>On-site fitness facilities at select locations</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span>Annual health screenings and flu shots</span>
              </li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Competitive Compensation
                </h3>
                <p className="text-center text-muted-foreground">
                  We offer competitive salaries based on experience, skills, and
                  market rates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  401(k) Matching
                </h3>
                <p className="text-center text-muted-foreground">
                  We match your 401(k) contributions up to 4% of your salary to
                  help you save for retirement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Equity Grants
                </h3>
                <p className="text-center text-muted-foreground">
                  All full-time employees receive equity grants, making you an
                  owner in our success.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 bg-muted p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">
              Additional Financial Benefits
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Performance-based bonuses</span>
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Employee stock purchase plan (ESPP)</span>
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Financial planning resources and advisors</span>
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Student loan repayment assistance</span>
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Commuter benefits and transportation allowances</span>
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Referral bonuses for helping us hire great talent</span>
              </li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Plane className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Generous PTO
                </h3>
                <p className="text-center text-muted-foreground">
                  Enjoy unlimited paid time off to rest, recharge, and explore
                  the world.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Flexible Work Hours
                </h3>
                <p className="text-center text-muted-foreground">
                  Work when you're most productive with flexible scheduling
                  options.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Parental Leave
                </h3>
                <p className="text-center text-muted-foreground">
                  Generous paid parental leave for all new parents, including
                  adoption and foster care.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 bg-muted p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">
              Additional Time Off Benefits
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Paid holidays and company-wide breaks</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Sabbatical program for long-term employees</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Volunteer time off to give back to the community</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Bereavement leave and family care time</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Mental health days when you need a break</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Flexible work-from-home policies</span>
              </li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="perks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Coffee className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Free Food & Drinks
                </h3>
                <p className="text-center text-muted-foreground">
                  Enjoy catered lunches, snacks, and beverages in all our
                  offices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Learning Stipend
                </h3>
                <p className="text-center text-muted-foreground">
                  $1,500 annual stipend for books, courses, conferences, and
                  other learning opportunities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Team Events
                </h3>
                <p className="text-center text-muted-foreground">
                  Regular team outings, retreats, and social events to build
                  connections.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 bg-muted p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">
              Additional Perks & Extras
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                <span>Home office stipend for remote workers</span>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                <span>Cell phone and internet reimbursement</span>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                <span>Employee discount programs</span>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                <span>Pet-friendly offices</span>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                <span>Gym memberships and wellness reimbursements</span>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                <span>Company swag and anniversary gifts</span>
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
