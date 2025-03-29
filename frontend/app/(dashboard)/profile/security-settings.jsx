"use client";

import { Badge } from "@/components/ui/badge";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Key,
  Lock,
  LogOut,
  Shield,
  Smartphone,
} from "lucide-react";

export default function SecuritySettings({ user }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    loginNotifications: true,
    sessionTimeout: "30 minutes",
    passwordLastChanged: "45 days ago",
    activeSessions: [
      {
        id: "session-1",
        device: "Chrome on Windows",
        location: "Miami, FL, USA",
        ip: "192.168.1.1",
        lastActive: "Current session",
      },
      {
        id: "session-2",
        device: "Safari on iPhone",
        location: "Miami, FL, USA",
        ip: "192.168.1.2",
        lastActive: "2 hours ago",
      },
    ],
  });

  const toggleTwoFactor = (checked) => {
    setSecuritySettings({
      ...securitySettings,
      twoFactorEnabled: checked,
    });
  };

  const toggleLoginNotifications = (checked) => {
    setSecuritySettings({
      ...securitySettings,
      loginNotifications: checked,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Password</h3>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-subText" />
            <span className="text-subText">
              Password last changed {securitySettings.passwordLastChanged}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Password Requirements:</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                <span>Minimum 8 characters</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                <span>At least one uppercase letter</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                <span>At least one number</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                <span>At least one special character</span>
              </li>
            </ul>
          </div>

          <Button>Update Password</Button>
        </form>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-inputBackground p-2 rounded-md">
                  <Smartphone className="h-5 w-5 text-brown" />
                </div>
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-subText">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={toggleTwoFactor}
              />
            </div>

            {securitySettings.twoFactorEnabled && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm mb-3">
                  Two-factor authentication is currently enabled. You'll be
                  asked for a verification code when logging in from new
                  devices.
                </p>
                <Button variant="outline" size="sm">
                  <Key className="mr-2 h-4 w-4" />
                  Manage 2FA Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Security Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Login Notifications</h4>
              <p className="text-sm text-subText">
                Receive email notifications for new logins to your account
              </p>
            </div>
            <Switch
              checked={securitySettings.loginNotifications}
              onCheckedChange={toggleLoginNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Session Timeout</h4>
              <p className="text-sm text-subText">
                Automatically log out after a period of inactivity
              </p>
            </div>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={securitySettings.sessionTimeout}
              onChange={(e) =>
                setSecuritySettings({
                  ...securitySettings,
                  sessionTimeout: e.target.value,
                })
              }
            >
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="4 hours">4 hours</option>
              <option value="Never">Never</option>
            </select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Active Sessions</h3>
          <Button variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out All Devices
          </Button>
        </div>

        <div className="space-y-3">
          {securitySettings.activeSessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-inputBackground p-2 rounded-md">
                      <Shield className="h-5 w-5 text-subText" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{session.device}</h4>
                        {session.lastActive === "Current session" && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-subText mt-1">
                        <div>Location: {session.location}</div>
                        <div>IP Address: {session.ip}</div>
                        <div>Last active: {session.lastActive}</div>
                      </div>
                    </div>
                  </div>
                  {session.lastActive !== "Current session" && (
                    <Button variant="outline" size="sm">
                      <Lock className="mr-2 h-4 w-4" />
                      Revoke
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
