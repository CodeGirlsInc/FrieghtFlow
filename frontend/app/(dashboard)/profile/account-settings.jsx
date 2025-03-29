"use client";

import { Badge } from "@/components/ui/badge";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AccountSettings({ user, setUser }) {
  const [formData, setFormData] = useState({
    ...user,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    weeklyReports: true,
    shipmentUpdates: true,
    billingAlerts: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (name, checked) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      ...formData,
    });
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Phone Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) =>
                      handleSelectChange("language", value)
                    }
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) =>
                      handleSelectChange("timezone", value)
                    }
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8 (Pacific Time)">
                        UTC-8 (Pacific Time)
                      </SelectItem>
                      <SelectItem value="UTC-7 (Mountain Time)">
                        UTC-7 (Mountain Time)
                      </SelectItem>
                      <SelectItem value="UTC-6 (Central Time)">
                        UTC-6 (Central Time)
                      </SelectItem>
                      <SelectItem value="UTC-5 (Eastern Time)">
                        UTC-5 (Eastern Time)
                      </SelectItem>
                      <SelectItem value="UTC+0 (GMT)">UTC+0 (GMT)</SelectItem>
                      <SelectItem value="UTC+1 (CET)">UTC+1 (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredCurrency">Preferred Currency</Label>
                  <Select
                    value={formData.preferredCurrency}
                    onValueChange={(value) =>
                      handleSelectChange("preferredCurrency", value)
                    }
                  >
                    <SelectTrigger id="preferredCurrency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">
                        AUD - Australian Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="notifications">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <p className="text-sm text-subText">
                  Manage your email notification preferences
                </p>
              </div>
              <Switch
                checked={formData.emailNotifications}
                onCheckedChange={(checked) =>
                  handleSwitchChange("emailNotifications", checked)
                }
              />
            </div>

            <div className="space-y-3 ml-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Reports</h4>
                  <p className="text-sm text-subText">
                    Receive weekly shipping activity reports
                  </p>
                </div>
                <Switch
                  checked={formData.weeklyReports}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("weeklyReports", checked)
                  }
                  disabled={!formData.emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Shipment Updates</h4>
                  <p className="text-sm text-subText">
                    Get notified about status changes to your shipments
                  </p>
                </div>
                <Switch
                  checked={formData.shipmentUpdates}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("shipmentUpdates", checked)
                  }
                  disabled={!formData.emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Billing Alerts</h4>
                  <p className="text-sm text-subText">
                    Receive notifications about billing and payments
                  </p>
                </div>
                <Switch
                  checked={formData.billingAlerts}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("billingAlerts", checked)
                  }
                  disabled={!formData.emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing Emails</h4>
                  <p className="text-sm text-subText">
                    Receive promotional offers and updates
                  </p>
                </div>
                <Switch
                  checked={formData.marketingEmails}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("marketingEmails", checked)
                  }
                  disabled={!formData.emailNotifications}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">SMS Notifications</h3>
                <p className="text-sm text-subText">
                  Manage your SMS notification preferences
                </p>
              </div>
              <Switch
                checked={formData.smsNotifications}
                onCheckedChange={(checked) =>
                  handleSwitchChange("smsNotifications", checked)
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Save Preferences</Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="billing">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Billing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingName">Billing Name</Label>
                <Input
                  id="billingName"
                  name="billingName"
                  defaultValue={user.company}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input
                  id="billingEmail"
                  name="billingEmail"
                  type="email"
                  defaultValue={user.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  name="billingAddress"
                  defaultValue={user.address}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                <Input id="taxId" name="taxId" defaultValue="US-123456789" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Subscription Plan</h3>
              <Badge className="bg-brown text-white">Enterprise</Badge>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Enterprise Plan</h4>
                    <p className="text-sm text-subText">
                      Unlimited shipments, priority support, advanced analytics
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">$499/month</p>
                    <p className="text-sm text-subText">
                      Next billing: Apr 15, 2023
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="destructive">Cancel Subscription</Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Methods</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-inputBackground p-2 rounded-md">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="4" fill="#1A1F71" />
                        <path d="M9.5 15H7L8.5 9H11L9.5 15Z" fill="#FFFFFF" />
                        <path
                          d="M15.5 9.2C14.8 9 14 8.9 13 9.3C13 9.3 13.3 9 14.1 9H16.9L16.5 11C16.5 11 16.3 10.3 15.5 9.2Z"
                          fill="#FFFFFF"
                        />
                        <path
                          d="M16.4 11.7C16.4 11.7 16.6 11.6 16.8 11.5L17 11L16.7 13C16.7 13 16.5 12.1 16.4 11.7Z"
                          fill="#FFFFFF"
                        />
                        <path
                          d="M13.1 13.1L13.5 11.3C13.5 11.3 14.1 12.3 14.2 12.9L13.8 14.7C13.8 14.7 13.2 13.7 13.1 13.1Z"
                          fill="#FFFFFF"
                        />
                        <path
                          d="M18 9H15.5L15.1 10.6C15.1 10.6 15.7 11.4 16 11.5L18 9Z"
                          fill="#FFFFFF"
                        />
                        <path
                          d="M14.5 12.5C14.8 12.6 15.2 12.6 15.6 12.4L16 11L15.2 14.5C15.2 14.5 14.9 13.8 14.5 13.5L14.5 12.5Z"
                          fill="#FFFFFF"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Visa ending in 4242</h4>
                      <p className="text-sm text-subText">Expires 09/2025</p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button variant="outline">Add Payment Method</Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
