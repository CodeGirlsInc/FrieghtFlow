"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { ArrowUp, Calendar, Ship, TrendingUp, Truck } from "lucide-react";

// Mock data for charts
const monthlyData = [
  { name: "Jan", shipments: 12, value: 4000 },
  { name: "Feb", shipments: 19, value: 6000 },
  { name: "Mar", shipments: 15, value: 5500 },
  { name: "Apr", shipments: 21, value: 7800 },
  { name: "May", shipments: 18, value: 6300 },
  { name: "Jun", shipments: 24, value: 9100 },
];

const weeklyData = [
  { name: "Mon", shipments: 3, value: 1200 },
  { name: "Tue", shipments: 5, value: 1800 },
  { name: "Wed", shipments: 2, value: 900 },
  { name: "Thu", shipments: 7, value: 2400 },
  { name: "Fri", shipments: 4, value: 1500 },
  { name: "Sat", shipments: 1, value: 600 },
  { name: "Sun", shipments: 0, value: 0 },
];

export default function ProfileStats() {
  const [timeframe, setTimeframe] = useState("monthly");
  const [stats, setStats] = useState({
    totalShipments: 109,
    activeShipments: 4,
    totalValue: "$38,700",
    avgDeliveryTime: "4.2 days",
    completedOnTime: "94%",
    preferredCarrier: "FastFreight Inc.",
  });

  const chartData = timeframe === "monthly" ? monthlyData : weeklyData;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Shipping Performance
          </CardTitle>
          <Tabs
            value={timeframe}
            onValueChange={setTimeframe}
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col">
            <span className="text-sm text-subText">Total Shipments</span>
            <div className="flex items-center mt-1">
              <Ship className="h-4 w-4 mr-1 text-brown" />
              <span className="text-xl font-semibold">
                {stats.totalShipments}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-subText">Active Shipments</span>
            <div className="flex items-center mt-1">
              <Truck className="h-4 w-4 mr-1 text-brown" />
              <span className="text-xl font-semibold">
                {stats.activeShipments}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-subText">Total Value</span>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 mr-1 text-brown" />
              <span className="text-xl font-semibold">{stats.totalValue}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-subText">Avg. Delivery Time</span>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1 text-brown" />
              <span className="text-xl font-semibold">
                {stats.avgDeliveryTime}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-subText">On-Time Delivery</span>
            <div className="flex items-center mt-1">
              <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-xl font-semibold">
                {stats.completedOnTime}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-subText">Preferred Carrier</span>
            <div className="flex items-center mt-1">
              <span className="text-base font-medium truncate">
                {stats.preferredCarrier}
              </span>
            </div>
          </div>
        </div>

        <div className="h-[300px] mt-6">
          <Tabs defaultValue="shipments" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="shipments">Shipments</TabsTrigger>
              <TabsTrigger value="value">Value</TabsTrigger>
            </TabsList>

            <TabsContent value="shipments" className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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

            <TabsContent value="value" className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
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
      </CardContent>
    </Card>
  );
}
