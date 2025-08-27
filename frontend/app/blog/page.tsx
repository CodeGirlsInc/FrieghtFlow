import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, ArrowLeft } from "lucide-react";

// Mock blog data - in a real app, this would come from a CMS or API
const blogPosts = [
  {
    id: 1,
    title: "Getting Started with Authentication Best Practices",
    description:
      "Learn how to implement secure authentication in your applications with industry-standard practices and security measures.",
    category: "Security",
    date: "2024-01-15",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: 2,
    title: "Platform Update: New Dashboard Features",
    description:
      "We've rolled out exciting new dashboard features including advanced analytics, custom widgets, and improved user management.",
    category: "Platform Updates",
    date: "2024-01-12",
    readTime: "3 min read",
    featured: false,
  },
  {
    id: 3,
    title: "Building Scalable APIs with Next.js",
    description:
      "A comprehensive guide to creating robust and scalable API endpoints using Next.js App Router and modern development patterns.",
    category: "Development",
    date: "2024-01-10",
    readTime: "8 min read",
    featured: false,
  },
  {
    id: 4,
    title: "Security Update: Enhanced Two-Factor Authentication",
    description:
      "Important security improvements including enhanced 2FA options and new security monitoring features for better account protection.",
    category: "Platform Updates",
    date: "2024-01-08",
    readTime: "4 min read",
    featured: false,
  },
  {
    id: 5,
    title: "UI/UX Design Principles for Modern Web Apps",
    description:
      "Explore essential design principles and best practices for creating intuitive and accessible user interfaces in modern web applications.",
    category: "Design",
    date: "2024-01-05",
    readTime: "6 min read",
    featured: false,
  },
];

const categories = [
  "All",
  "Security",
  "Platform Updates",
  "Development",
  "Design",
];

export default function BlogPage() {
  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" size="sm" asChild className="mb-4">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-balance">
                Blog & Resources
              </h1>
              <p className="text-muted-foreground mt-2">
                Educational articles, platform updates, and development insights
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Featured Article</h2>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{featuredPost.category}</Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Featured
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-balance">
                  {featuredPost.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {featuredPost.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(featuredPost.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <Button className="mt-4">Read Article</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Latest Articles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-lg text-balance leading-tight">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </main>
    </div>
  );
}
