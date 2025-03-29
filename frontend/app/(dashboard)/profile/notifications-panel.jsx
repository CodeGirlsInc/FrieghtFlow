"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Bell,
  Check,
  Clock,
  FileText,
  ShieldAlert,
  Truck,
} from "lucide-react";

// Mock data for notifications
const mockNotifications = [
  {
    id: "notif-1",
    title: "Shipment Delivered",
    message: "Shipment #SH-78945 has been delivered successfully.",
    time: "10 minutes ago",
    read: false,
    type: "shipment",
    priority: "normal",
  },
  {
    id: "notif-2",
    title: "Payment Processed",
    message:
      "Your payment of $2,450 for invoice #INV-2023-056 has been processed.",
    time: "2 hours ago",
    read: false,
    type: "payment",
    priority: "normal",
  },
  {
    id: "notif-3",
    title: "New Document Required",
    message:
      "Please upload the updated insurance certificate for your account.",
    time: "1 day ago",
    read: false,
    type: "document",
    priority: "high",
  },
  {
    id: "notif-4",
    title: "Shipment Delayed",
    message: "Shipment #SH-78949 has been delayed due to weather conditions.",
    time: "1 day ago",
    read: true,
    type: "shipment",
    priority: "high",
  },
  {
    id: "notif-5",
    title: "Security Alert",
    message: "New login detected from an unrecognized device. Please verify.",
    time: "2 days ago",
    read: true,
    type: "security",
    priority: "critical",
  },
  {
    id: "notif-6",
    title: "Shipment Ready for Pickup",
    message: "Shipment #SH-78952 is ready for pickup at the warehouse.",
    time: "3 days ago",
    read: true,
    type: "shipment",
    priority: "normal",
  },
  {
    id: "notif-7",
    title: "Rate Change Notice",
    message:
      "Shipping rates for international routes will change on April 15, 2023.",
    time: "5 days ago",
    read: true,
    type: "system",
    priority: "normal",
  },
];

export default function NotificationsPanel({ limit }) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const displayedNotifications = limit
    ? notifications.slice(0, limit)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case "shipment":
        return priority === "high" ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Truck className="h-5 w-5 text-brown" />
        );
      case "payment":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "security":
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-subText" />;
      default:
        return <Bell className="h-5 w-5 text-subText" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-brown text-white">{unreadCount}</Badge>
            )}
          </div>
          {!limit && unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Bell className="h-8 w-8 text-subText mb-2" />
              <h3 className="font-medium">No notifications</h3>
              <p className="text-sm text-subText mt-1">You're all caught up!</p>
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-3 p-3 rounded-md ${
                  notification.read ? "bg-background" : "bg-inputBackground"
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(
                    notification.type,
                    notification.priority
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">{notification.title}</h4>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-subText mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center text-xs text-subText mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{notification.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}

          {limit && notifications.length > limit && (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm">
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
