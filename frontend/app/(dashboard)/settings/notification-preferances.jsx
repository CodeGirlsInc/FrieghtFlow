"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Check, Mail, MessageSquare, Smartphone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NotificationPreferences({ userData }) {
  const [notifications, setNotifications] = useState(userData.notifications);
  const [activeTab, setActiveTab] = useState("email");
  const [successMessage, setSuccessMessage] = useState("");

  const handleToggle = (category, setting, checked) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: checked,
      },
    }));
  };

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage("Notification preferences updated successfully");
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Notification Preferences
        </h2>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose which channels you want to receive notifications on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="push" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Push</span>
              </TabsTrigger>
              <TabsTrigger value="inApp" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>In-App</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-6">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={Object.values(notifications.email).some((v) => v)}
                  onCheckedChange={(checked) => {
                    const updatedEmail = {};
                    for (const key in notifications.email) {
                      updatedEmail[key] = checked;
                    }
                    setNotifications((prev) => ({
                      ...prev,
                      email: updatedEmail,
                    }));
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Shipment Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Status changes and delivery notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.shipmentUpdates}
                    onCheckedChange={(checked) =>
                      handleToggle("email", "shipmentUpdates", checked)
                    }
                    disabled={
                      !Object.values(notifications.email).some((v) => v)
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Marketing Emails</h4>
                    <p className="text-sm text-muted-foreground">
                      Promotions, news, and special offers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.marketingEmails}
                    onCheckedChange={(checked) =>
                      handleToggle("email", "marketingEmails", checked)
                    }
                    disabled={
                      !Object.values(notifications.email).some((v) => v)
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Security Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Login attempts and security notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.securityAlerts}
                    onCheckedChange={(checked) =>
                      handleToggle("email", "securityAlerts", checked)
                    }
                    disabled={
                      !Object.values(notifications.email).some((v) => v)
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Weekly Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Summary of your shipping activity
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.weeklyReports}
                    onCheckedChange={(checked) =>
                      handleToggle("email", "weeklyReports", checked)
                    }
                    disabled={
                      !Object.values(notifications.email).some((v) => v)
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Billing Notices</h4>
                    <p className="text-sm text-muted-foreground">
                      Invoices, payment confirmations, and billing updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email.billingNotices}
                    onCheckedChange={(checked) =>
                      handleToggle("email", "billingNotices", checked)
                    }
                    disabled={
                      !Object.values(notifications.email).some((v) => v)
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="push" className="space-y-4 mt-6">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your mobile devices
                  </p>
                </div>
                <Switch
                  checked={Object.values(notifications.push).some((v) => v)}
                  onCheckedChange={(checked) => {
                    const updatedPush = {};
                    for (const key in notifications.push) {
                      updatedPush[key] = checked;
                    }
                    setNotifications((prev) => ({
                      ...prev,
                      push: updatedPush,
                    }));
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Shipment Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Status changes and delivery notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push.shipmentUpdates}
                    onCheckedChange={(checked) =>
                      handleToggle("push", "shipmentUpdates", checked)
                    }
                    disabled={!Object.values(notifications.push).some((v) => v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Security Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Login attempts and security notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push.securityAlerts}
                    onCheckedChange={(checked) =>
                      handleToggle("push", "securityAlerts", checked)
                    }
                    disabled={!Object.values(notifications.push).some((v) => v)}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Billing Notices</h4>
                    <p className="text-sm text-muted-foreground">
                      Invoices, payment confirmations, and billing updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push.billingNotices}
                    onCheckedChange={(checked) =>
                      handleToggle("push", "billingNotices", checked)
                    }
                    disabled={!Object.values(notifications.push).some((v) => v)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inApp" className="space-y-4 mt-6">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium">In-App Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications within the FreightFlow application
                  </p>
                </div>
                <Switch
                  checked={Object.values(notifications.inApp).some((v) => v)}
                  onCheckedChange={(checked) => {
                    const updatedInApp = {};
                    for (const key in notifications.inApp) {
                      updatedInApp[key] = checked;
                    }
                    setNotifications((prev) => ({
                      ...prev,
                      inApp: updatedInApp,
                    }));
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Shipment Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Status changes and delivery notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.inApp.shipmentUpdates}
                    onCheckedChange={(checked) =>
                      handleToggle("inApp", "shipmentUpdates", checked)
                    }
                    disabled={
                      !Object.values(notifications.inApp).some((v) => v)
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Marketing Messages</h4>
                    <p className="text-sm text-muted-foreground">
                      Promotions, news, and special offers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.inApp.marketingMessages}
                    onCheckedChange={(checked) =>
                      handleToggle("inApp", "marketingMessages", checked)
                    }
                    disabled={
                      !Object.values(notifications.inApp).some((v) => v)
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>Security Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Login attempts and security notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.inApp.securityAlerts}
                    onCheckedChange={(checked) =>
                      handleToggle("inApp", "securityAlerts", checked)
                    }
                    disabled={
                      !Object.values(notifications.inApp).some((v) => v)
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4>System Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Platform updates, maintenance, and new features
                    </p>
                  </div>
                  <Switch
                    checked={notifications.inApp.systemUpdates}
                    onCheckedChange={(checked) =>
                      handleToggle("inApp", "systemUpdates", checked)
                    }
                    disabled={
                      !Object.values(notifications.inApp).some((v) => v)
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Schedule</CardTitle>
          <CardDescription>
            Control when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Quiet Hours</h3>
              <p className="text-sm text-muted-foreground">
                Pause non-critical notifications during specific hours
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Digest Mode</h3>
              <p className="text-sm text-muted-foreground">
                Receive a daily digest instead of individual notifications
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Weekend Pause</h3>
              <p className="text-sm text-muted-foreground">
                Pause non-critical notifications on weekends
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Schedule</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
