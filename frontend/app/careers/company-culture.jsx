import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Lightbulb, Target, Award, Zap } from "lucide-react";

export default function CompanyCulture() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Our Culture</h2>
        <p className="text-lg text-muted-foreground">
          At FreightFlow, we believe that our culture is the foundation of our
          success. We're building a team of passionate, innovative, and
          collaborative individuals who are committed to transforming the
          freight industry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Heart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">
              Customer-Centric
            </h3>
            <p className="text-center text-muted-foreground">
              We put our customers at the center of everything we do. Their
              success is our success.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">
              Innovation
            </h3>
            <p className="text-center text-muted-foreground">
              We're constantly pushing the boundaries of what's possible in the
              freight industry.
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
              Collaboration
            </h3>
            <p className="text-center text-muted-foreground">
              We believe that the best ideas come from diverse teams working
              together.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">
              Impact-Driven
            </h3>
            <p className="text-center text-muted-foreground">
              We focus on making a meaningful impact on our customers, industry,
              and society.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Award className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">
              Excellence
            </h3>
            <p className="text-center text-muted-foreground">
              We strive for excellence in everything we do, from code to
              customer service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">
              Ownership
            </h3>
            <p className="text-center text-muted-foreground">
              We take ownership of our work and are accountable for our results.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="work" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="work">How We Work</TabsTrigger>
            <TabsTrigger value="learn">Learning & Development</TabsTrigger>
            <TabsTrigger value="diversity">Diversity & Inclusion</TabsTrigger>
          </TabsList>

          <TabsContent value="work" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  Flexible & Collaborative
                </h3>
                <p className="text-muted-foreground mb-4">
                  We believe in giving our team the flexibility to work in the
                  way that's most productive for them. Whether you're in one of
                  our offices or working remotely, we provide the tools and
                  support you need to do your best work.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our collaborative approach means that we value input from
                  everyone, regardless of role or seniority. We believe that the
                  best ideas can come from anywhere, and we encourage open
                  communication and feedback.
                </p>
                <p className="text-muted-foreground">
                  We use a mix of synchronous and asynchronous communication to
                  ensure that everyone can stay connected and informed,
                  regardless of their location or time zone.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden h-[300px]">
                <img
                  src="/placeholder.svg?height=300&width=500"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="learn" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-lg overflow-hidden h-[300px]">
                <img
                  src="/placeholder.svg?height=300&width=500"
                  alt="Learning and development"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  Continuous Growth
                </h3>
                <p className="text-muted-foreground mb-4">
                  We're committed to helping our team members grow both
                  professionally and personally. We provide a range of learning
                  and development opportunities, from formal training programs
                  to mentorship and coaching.
                </p>
                <p className="text-muted-foreground mb-4">
                  Each team member has a personal development budget that they
                  can use for conferences, courses, books, or other learning
                  resources. We also have regular internal knowledge-sharing
                  sessions and workshops.
                </p>
                <p className="text-muted-foreground">
                  We believe that growth happens when you're challenged, so we
                  encourage our team members to take on new responsibilities and
                  projects that stretch their skills and knowledge.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diversity" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  Inclusive by Design
                </h3>
                <p className="text-muted-foreground mb-4">
                  We believe that diversity of thought, background, and
                  experience leads to better decision-making and innovation.
                  We're committed to building a diverse team and an inclusive
                  culture where everyone feels valued and respected.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our diversity and inclusion initiatives include targeted
                  recruitment efforts, unconscious bias training, employee
                  resource groups, and regular review of our policies and
                  practices to ensure they promote equity.
                </p>
                <p className="text-muted-foreground">
                  We know that building an inclusive culture is an ongoing
                  journey, not a destination. We're constantly learning,
                  listening, and evolving our approach based on feedback from
                  our team and best practices in the industry.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden h-[300px]">
                <img
                  src="/placeholder.svg?height=300&width=500"
                  alt="Diverse team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
