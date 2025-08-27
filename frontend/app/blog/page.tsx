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
