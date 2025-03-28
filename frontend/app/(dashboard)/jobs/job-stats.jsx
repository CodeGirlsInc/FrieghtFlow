import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, MapPin, Star, Truck } from "lucide-react";

export default function JobStats({ stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-4">Your Stats</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-subText" />
              <span className="text-sm">Jobs Completed</span>
            </div>
            <span className="font-bold">{stats.jobsCompleted}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm">Total Earnings</span>
            </div>
            <span className="font-bold">
              {formatCurrency(stats.totalEarnings)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Average Rating</span>
            </div>
            <span className="font-bold">
              {stats.averageRating}/5 ({stats.reviewCount})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Application Success</span>
            </div>
            <span className="font-bold">{stats.applicationSuccessRate}%</span>
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Recent Earnings</h4>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.recentEarnings}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => [
                      `${formatCurrency(value)}`,
                      "Earnings",
                    ]}
                    labelFormatter={(label) => `Week: ${label}`}
                  />
                  <Bar dataKey="amount" fill="#b57704" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Top Routes</h4>
            <div className="space-y-2">
              {stats.topRoutes.map((route, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-subText" />
                    <span>
                      {route.from} → {route.to}
                    </span>
                  </div>
                  <span className="text-subText">{route.count} jobs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
