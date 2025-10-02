"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { withAuthRequired } from "@/lib/with-auth";
import {
  User,
  Settings,
  LogOut,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Bell,
  Search,
} from "lucide-react";

function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const stats = [
    {
      title: "Total Shipments",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Package,
    },
    {
      title: "Active Routes",
      value: "56",
      change: "+8%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Total Customers",
      value: "789",
      change: "+5%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Revenue",
      value: "$45,678",
      change: "+15%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "shipment",
      message: "New shipment #SH-001 created",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "delivery",
      message: "Shipment #SH-045 delivered successfully",
      time: "15 minutes ago",
    },
    {
      id: 3,
      type: "route",
      message: "Route optimization completed for Zone A",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "customer",
      message: "New customer registration: ABC Corp",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FreightFlow</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || "User"}!
            </h2>
            <p className="mt-2 text-gray-600">
              See what is happening with your freight operations today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </p>
                      <p
                        className={`ml-2 text-sm font-medium ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0">
                        <Activity className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link
                    href="/activity"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View all activity →
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/shipments/new"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Package className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      New Shipment
                    </span>
                  </Link>

                  <Link
                    href="/routes"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      View Routes
                    </span>
                  </Link>

                  <Link
                    href="/customers"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Customers
                    </span>
                  </Link>

                  <Link
                    href="/profile"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-8 w-8 text-gray-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Settings
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuthRequired(DashboardPage);
