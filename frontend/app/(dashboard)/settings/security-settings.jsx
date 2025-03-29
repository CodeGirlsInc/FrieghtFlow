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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SecuritySettings({ userData }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetupStep, setTwoFactorSetupStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [activeSessions, setActiveSessions] = useState([
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
    {
      id: "session-3",
      device: "Firefox on MacOS",
      location: "New York, NY, USA",
      ip: "192.168.1.3",
      lastActive: "Yesterday",
    },
  ]);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage("Password updated successfully");
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 500);
  };

  const handleTwoFactorSetup = () => {
    if (twoFactorSetupStep === 1) {
      // Simulate generating QR code
      setTwoFactorSetupStep(2);
    } else if (twoFactorSetupStep === 2) {
      // Simulate verifying code
      setTwoFactorSetupStep(3);
    } else {
      // Finish setup
      setTwoFactorEnabled(true);
      setTwoFactorSetupStep(1);
      setSuccessMessage("Two-factor authentication enabled successfully");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  const handleRevokeSession = (sessionId) => {
    setActiveSessions(
      activeSessions.filter((session) => session.id !== sessionId)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">
          Manage your account security and authentication methods
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
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
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

            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-md">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Secure your account with 2FA
                </p>
              </div>
            </div>
            {twoFactorEnabled ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Check className="mr-1 h-3 w-3" /> Enabled
              </Badge>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Set Up 2FA</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      {twoFactorSetupStep === 1 &&
                        "Secure your account with two-factor authentication."}
                      {twoFactorSetupStep === 2 &&
                        "Scan the QR code with your authenticator app."}
                      {twoFactorSetupStep === 3 &&
                        "Enter the verification code to complete setup."}
                    </DialogDescription>
                  </DialogHeader>

                  {twoFactorSetupStep === 1 && (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">
                          Choose Authentication Method
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-accent">
                            <Smartphone className="h-5 w-5" />
                            <div>
                              <h5 className="font-medium">Authenticator App</h5>
                              <p className="text-sm text-muted-foreground">
                                Use an app like Google Authenticator
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-accent opacity-50">
                            <div>
                              <h5 className="font-medium">
                                SMS Authentication
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                Receive codes via text message
                              </p>
                            </div>
                            <Badge>Coming Soon</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {twoFactorSetupStep === 2 && (
                    <div className="space-y-4 py-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-48 h-48 bg-muted rounded-md flex items-center justify-center mb-4">
                          <img
                            src="/placeholder.svg?height=180&width=180"
                            alt="QR Code"
                            className="w-full h-full"
                          />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">
                          Scan this QR code with your authenticator app, or
                          enter the code manually:
                        </p>
                        <div className="mt-2 p-2 bg-muted rounded-md font-mono text-sm">
                          ABCD-EFGH-IJKL-MNOP
                        </div>
                      </div>
                    </div>
                  )}

                  {twoFactorSetupStep === 3 && (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="verification-code">
                          Verification Code
                        </Label>
                        <Input
                          id="verification-code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter the 6-digit code from your authenticator app to
                          verify setup
                        </p>
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    {twoFactorSetupStep > 1 && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setTwoFactorSetupStep((prev) => prev - 1)
                        }
                      >
                        Back
                      </Button>
                    )}
                    <Button onClick={handleTwoFactorSetup}>
                      {twoFactorSetupStep === 1 && "Continue"}
                      {twoFactorSetupStep === 2 && "Next"}
                      {twoFactorSetupStep === 3 && "Complete Setup"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {twoFactorEnabled && (
            <div className="flex justify-between items-center mt-4 p-4 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">
                  Two-factor authentication is enabled
                </span>
              </div>
              <Button variant="outline" size="sm">
                <Key className="mr-2 h-4 w-4" />
                Manage 2FA
              </Button>
            </div>
          )}
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices that are currently logged into your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-md">
                  <Shield className="h-5 w-5" />
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
                  <div className="text-sm text-muted-foreground mt-1">
                    <div>Location: {session.location}</div>
                    <div>IP Address: {session.ip}</div>
                    <div>Last active: {session.lastActive}</div>
                  </div>
                </div>
              </div>
              {session.lastActive !== "Current session" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Revoke
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out All Other Devices
          </Button>
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login activity on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-2">
              <div className="bg-green-100 text-green-800 p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Successful login</h4>
                  <span className="text-sm text-muted-foreground">
                    Today, 10:42 AM
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chrome on Windows • Miami, FL, USA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="bg-green-100 text-green-800 p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Successful login</h4>
                  <span className="text-sm text-muted-foreground">
                    Yesterday, 8:15 PM
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Safari on iPhone • Miami, FL, USA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="bg-red-100 text-red-800 p-1 rounded-full">
                <X className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Failed login attempt</h4>
                  <span className="text-sm text-muted-foreground">
                    3 days ago, 11:30 AM
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Unknown device • New York, NY, USA
                </p>
              </div>
            </div>
          </div>

          <Button variant="link" className="mt-4 p-0">
            View full login history
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
