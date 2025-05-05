"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Check, Eye, EyeOff, Globe, Lock, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PrivacySettings({ userData }) {
  const [privacy, setPrivacy] = useState(userData.privacy);
  const [successMessage, setSuccessMessage] = useState("");

  const handleProfileVisibilityChange = (value) => {
    setPrivacy((prev) => ({
      ...prev,
      profileVisibility: value,
    }));
  };

  const handleToggle = (setting, checked) => {
    setPrivacy((prev) => ({
      ...prev,
      [setting]: checked,
    }));
  };

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage("Privacy settings updated successfully");
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Privacy Settings</h2>
        <p className="text-muted-foreground">
          Control your data and visibility preferences
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
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>
            Control who can see your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={privacy.profileVisibility}
            onValueChange={handleProfileVisibilityChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="public"
                id="visibility-public"
                className="sr-only"
              />
              <Label
                htmlFor="visibility-public"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <Globe className="mb-3 h-6 w-6" />
                <div className="space-y-1 text-center">
                  <h4 className="font-medium">Public</h4>
                  <p className="text-sm text-muted-foreground">
                    Anyone can view your profile
                  </p>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="contacts"
                id="visibility-contacts"
                className="sr-only"
              />
              <Label
                htmlFor="visibility-contacts"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <Users className="mb-3 h-6 w-6" />
                <div className="space-y-1 text-center">
                  <h4 className="font-medium">Contacts Only</h4>
                  <p className="text-sm text-muted-foreground">
                    Only your contacts can view your profile
                  </p>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="private"
                id="visibility-private"
                className="sr-only"
              />
              <Label
                htmlFor="visibility-private"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <Lock className="mb-3 h-6 w-6" />
                <div className="space-y-1 text-center">
                  <h4 className="font-medium">Private</h4>
                  <p className="text-sm text-muted-foreground">
                    Only you can view your profile
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle>Data Sharing & Privacy</CardTitle>
          <CardDescription>
            Control how your data is used and shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Data Sharing with Partners</h3>
              <p className="text-sm text-muted-foreground">
                Allow us to share anonymized data with trusted partners to
                improve services
              </p>
            </div>
            <Switch
              checked={privacy.dataSharing}
              onCheckedChange={(checked) =>
                handleToggle("dataSharing", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Activity Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Allow us to collect usage data to improve your experience
              </p>
            </div>
            <Switch
              checked={privacy.activityTracking}
              onCheckedChange={(checked) =>
                handleToggle("activityTracking", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Show Online Status</h3>
              <p className="text-sm text-muted-foreground">
                Let others see when you're active on the platform
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Search Engine Visibility</h3>
              <p className="text-sm text-muted-foreground">
                Allow search engines to index your public profile
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle>Activity Privacy</CardTitle>
          <CardDescription>
            Control what others can see about your activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Show Shipment History</h3>
              <p className="text-sm text-muted-foreground">
                Allow contacts to see your recent shipments
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Show Company Affiliations</h3>
              <p className="text-sm text-muted-foreground">
                Display your company and role to others
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Activity Feed Visibility</h3>
              <p className="text-sm text-muted-foreground">
                Show your activities in contacts' feeds
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookie Preferences</CardTitle>
          <CardDescription>
            Manage how we use cookies on this site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Essential Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Required for the website to function properly
              </p>
            </div>
            <Switch defaultChecked={true} disabled />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Performance Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Help us improve site performance and usability
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Functional Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Enable enhanced functionality and personalization
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Marketing Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Used to deliver relevant ads and track their effectiveness
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Reject All</Button>
          <Button>Accept All</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
