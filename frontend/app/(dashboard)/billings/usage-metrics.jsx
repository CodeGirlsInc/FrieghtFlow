"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Download,
  FileText,
  HelpCircle,
  Ship,
  Users,
} from "lucide-react";

// Mock data for charts
const monthlyData = [
  { name: "Jan", shipments: 65, apiCalls: 8500, storage: 1.2 },
  { name: "Feb", shipments: 72, apiCalls: 9200, storage: 1.5 },
  { name: "Mar", shipments: 87, apiCalls: 12500, storage: 2.4 },
];

const pieData = [
  { name: "Documents", value: 1.2 },
  { name: "Images", value: 0.8 },
  { name: "Invoices", value: 0.3 },
  { name: "Other", value: 0.1 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function UsageMetrics({ billingData, compact = false }) {
  const [timeframe, setTimeframe] = useState("monthly");

  const getUsagePercentage = (used, limit) => {
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const getUsageColor = (percentage) => {
    if (percentage < 60) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Usage Metrics</CardTitle>
          {!compact && (
            <Tabs
              value={timeframe}
              onValueChange={setTimeframe}
              className="w-[200px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-brown" />
                <h4 className="font-medium">Shipments</h4>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">
                  {billingData.usage.shipments.used}
                </span>
                <span className="text-subText">
                  / {billingData.usage.shipments.limit}
                </span>
              </div>
            </div>
            <Progress
              value={billingData.usage.shipments.percentage}
              className={`h-2 ${getUsageColor(
                billingData.usage.shipments.percentage
              )}`}
            />
            {billingData.usage.shipments.percentage > 80 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>
                  You're approaching your shipment limit. Consider upgrading
                  your plan.
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brown" />
                <h4 className="font-medium">Storage</h4>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">
                  {billingData.usage.storage.used}GB
                </span>
                <span className="text-subText">
                  / {billingData.usage.storage.limit}GB
                </span>
              </div>
            </div>
            <Progress
              value={billingData.usage.storage.percentage}
              className={`h-2 ${getUsageColor(
                billingData.usage.storage.percentage
              )}`}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brown" />
                <h4 className="font-medium">Team Members</h4>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">
                  {billingData.usage.users.used}
                </span>
                <span className="text-subText">
                  / {billingData.usage.users.limit}
                </span>
              </div>
            </div>
            <Progress
              value={billingData.usage.users.percentage}
              className={`h-2 ${getUsageColor(
                billingData.usage.users.percentage
              )}`}
            />
          </div>

          {!compact && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12Z"
                        stroke="#b57704"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.7 15.3L9.7 12.3C9.5 12.1 9.5 11.9 9.5 11.7V7"
                        stroke="#b57704"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <h4 className="font-medium">API Requests</h4>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">
                      {billingData.usage.api.used.toLocaleString()}
                    </span>
                    <span className="text-subText">
                      / {billingData.usage.api.limit.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Progress
                  value={billingData.usage.api.percentage}
                  className={`h-2 ${getUsageColor(
                    billingData.usage.api.percentage
                  )}`}
                />
              </div>

              <div className="h-[300px] mt-6">
                <Tabs defaultValue="shipments" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 mb-4">
                    <TabsTrigger value="shipments">Shipments</TabsTrigger>
                    <TabsTrigger value="storage">Storage</TabsTrigger>
                    <TabsTrigger value="api">API Usage</TabsTrigger>
                  </TabsList>

                  <TabsContent value="shipments" className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="shipments"
                          fill="#b57704"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabsContent>

                  <TabsContent value="storage" className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </TabsContent>

                  <TabsContent value="api" className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="apiCalls"
                          stroke="#b57704"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-subText">
                  <HelpCircle className="h-4 w-4" />
                  <span>Need help understanding your usage?</span>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Usage Data
                </Button>
              </div>
            </>
          )}

          {compact && (
            <Button variant="outline" size="sm" className="w-full">
              View Detailed Usage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
