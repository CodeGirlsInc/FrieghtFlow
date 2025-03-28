import {
  AlertCircle,
  Check,
  Clock,
  Edit,
  FileText,
  MessageSquare,
  Paperclip,
  RefreshCw,
  User,
} from "lucide-react";

export default function DisputeTimeline({ timeline }) {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "created":
        return <FileText className="h-5 w-5" />;
      case "assigned":
        return <User className="h-5 w-5" />;
      case "comment":
        return <MessageSquare className="h-5 w-5" />;
      case "attachment":
        return <Paperclip className="h-5 w-5" />;
      case "status_change":
        return <RefreshCw className="h-5 w-5" />;
      case "priority_change":
        return <AlertCircle className="h-5 w-5" />;
      case "edited":
        return <Edit className="h-5 w-5" />;
      case "resolution":
        return <Check className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "comment":
        return "bg-gray-100 text-gray-800";
      case "attachment":
        return "bg-indigo-100 text-indigo-800";
      case "status_change":
        return "bg-yellow-100 text-yellow-800";
      case "priority_change":
        return "bg-orange-100 text-orange-800";
      case "edited":
        return "bg-gray-100 text-gray-800";
      case "resolution":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium">Timeline</h3>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {timeline.map((event) => (
            <div key={event.id} className="relative pl-10">
              <div
                className={`absolute left-0 p-2 rounded-full ${getEventColor(
                  event.type
                )}`}
              >
                {getEventIcon(event.type)}
              </div>

              <div className="bg-muted p-4 rounded-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="font-medium">{event.description}</div>
                  <div className="text-sm text-subText">
                    {formatDateTime(event.date)}
                  </div>
                </div>
                <div className="text-sm text-subText mt-1">by {event.user}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
