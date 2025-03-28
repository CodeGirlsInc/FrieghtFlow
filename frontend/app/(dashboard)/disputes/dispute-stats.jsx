import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

export default function DisputeStats({ stats }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-4">Dispute Statistics</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-subText" />
              <span className="text-sm">Total Disputes</span>
            </div>
            <span className="font-bold">{stats.total}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Open Disputes</span>
            </div>
            <span className="font-bold">{stats.open}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Pending Disputes</span>
            </div>
            <span className="font-bold">{stats.pending}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Resolved Disputes</span>
            </div>
            <span className="font-bold">{stats.resolved}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">High Priority</span>
            </div>
            <span className="font-bold">{stats.highPriority}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Avg. Resolution Time</span>
            </div>
            <span className="font-bold">{stats.averageResolutionTime}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-subText">
            <HelpCircle className="h-4 w-4" />
            <span>View detailed reports</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
