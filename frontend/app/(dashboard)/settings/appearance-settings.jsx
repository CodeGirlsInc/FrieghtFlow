"use client";

import { useState, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AppearanceSettings({ userData }) {
  const [theme, setTheme] = useState(userData.theme);
  const [density, setDensity] = useState("comfortable");
  const [fontSize, setFontSize] = useState(16);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Simulate theme change
  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      if (systemTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage("Appearance settings updated successfully");
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
          Appearance Settings
        </h2>
        <p className="text-muted-foreground">
          Customize the look and feel of the application
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
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred color theme</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="light"
                id="theme-light"
                className="sr-only"
              />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <Sun className="mb-3 h-6 w-6" />
                <div className="space-y-1 text-center">
                  <h4 className="font-medium">Light</h4>
                  <p className="text-sm text-muted-foreground">
                    Light mode for daytime use
                  </p>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="dark"
                id="theme-dark"
                className="sr-only"
              />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <Moon className="mb-3 h-6 w-6" />
                <div className="space-y-1 text-center">
                  <h4 className="font-medium">Dark</h4>
                  <p className="text-sm text-muted-foreground">
                    Dark mode for reduced eye strain
                  </p>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="system"
                id="theme-system"
                className="sr-only"
              />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <Monitor className="mb-3 h-6 w-6" />
                <div className="space-y-1 text-center">
                  <h4 className="font-medium">System</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow system preferences
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle>Layout Density</CardTitle>
          <CardDescription>Adjust the spacing between elements</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={density}
            onValueChange={setDensity}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="compact"
                id="density-compact"
                className="sr-only"
              />
              <Label
                htmlFor="density-compact"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <div className="w-full h-16 bg-muted rounded-md flex flex-col justify-between p-1">
                  <div className="w-full h-2 bg-primary/20 rounded-sm"></div>
                  <div className="w-full h-2 bg-primary/20 rounded-sm"></div>
                  <div className="w-full h-2 bg-primary/20 rounded-sm"></div>
                  <div className="w-full h-2 bg-primary/20 rounded-sm"></div>
                </div>
                <div className="space-y-1 text-center mt-3">
                  <h4 className="font-medium">Compact</h4>
                  <p className="text-sm text-muted-foreground">
                    Minimal spacing between elements
                  </p>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="comfortable"
                id="density-comfortable"
                className="sr-only"
              />
              <Label
                htmlFor="density-comfortable"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <div className="w-full h-16 bg-muted rounded-md flex flex-col justify-between p-2">
                  <div className="w-full h-2 bg-primary/20 rounded-sm"></div>
                  <div className="w-full h-2 bg-primary/20 rounded-sm"></div>
                  <div className="w-full h-2 bg-primary/20 rounded-sm"></div>
                </div>
                <div className="space-y-1 text-center mt-3">
                  <h4 className="font-medium">Comfortable</h4>
                  <p className="text-sm text-muted-foreground">
                    Balanced spacing for most users
                  </p>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="spacious"
                id="density-spacious"
                className="sr-only"
              />
              <Label
                htmlFor="density-spacious"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
              >
                <div className="w-full h-16 bg-muted rounded-md flex flex-col justify-between p-3">
                  <div className="w-full h-2 bg-primary/20 rounded-sm"></div>
                  <div className="w-full h-2 bg-primary/20 rounded-sm"></div>
                </div>
                <div className="space-y-1 text-center mt-3">
                  <h4 className="font-medium">Spacious</h4>
                  <p className="text-sm text-muted-foreground">
                    Maximum spacing between elements
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle>Text Size</CardTitle>
          <CardDescription>
            Adjust the size of text throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Text Size</Label>
              <span className="text-sm text-muted-foreground">
                {fontSize}px
              </span>
            </div>
            <Slider
              value={[fontSize]}
              min={12}
              max={20}
              step={1}
              onValueChange={(value) => setFontSize(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>A</span>
              <span style={{ fontSize: "1.5em" }}>A</span>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <p className="mb-2" style={{ fontSize: `${fontSize}px` }}>
              Preview Text
            </p>
            <p
              className="text-sm text-muted-foreground"
              style={{ fontSize: `${fontSize - 2}px` }}
            >
              This is how your text will appear throughout the application.
            </p>
          </div>
        </CardContent>

        <Separator />

        <CardHeader>
          <CardTitle>Additional Options</CardTitle>
          <CardDescription>Fine-tune your visual experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Enable Animations</h3>
              <p className="text-sm text-muted-foreground">
                Show animations and transitions
              </p>
            </div>
            <Switch
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Show Status Indicators</h3>
              <p className="text-sm text-muted-foreground">
                Display colored indicators for shipment status
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Compact Navigation</h3>
              <p className="text-sm text-muted-foreground">
                Use a more compact navigation menu
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Reset to Defaults</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
