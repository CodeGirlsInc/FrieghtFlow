"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateProfile, changePassword } from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  walletAddress: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        walletAddress: user.walletAddress ?? "",
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (values: ProfileValues) => {
    try {
      const updated = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        walletAddress: values.walletAddress || undefined,
      });
      setUser(updated);
      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const onPasswordSubmit = async (values: PasswordValues) => {
    try {
      const { message } = await changePassword(values.currentPassword, values.newPassword);
      toast.success(message);
      resetPassword();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...regProfile("firstName")} />
              {profileErrors.firstName && (
                <p className="text-red-600 text-sm">{profileErrors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...regProfile("lastName")} />
              {profileErrors.lastName && (
                <p className="text-red-600 text-sm">{profileErrors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input id="walletAddress" {...regProfile("walletAddress")} placeholder="0x..." />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted" />
            </div>

            <Button type="submit" disabled={profileSubmitting}>
              {profileSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassword(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" {...regPassword("currentPassword")} />
              {passwordErrors.currentPassword && (
                <p className="text-red-600 text-sm">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...regPassword("newPassword")} />
              {passwordErrors.newPassword && (
                <p className="text-red-600 text-sm">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...regPassword("confirmPassword")} />
              {passwordErrors.confirmPassword && (
                <p className="text-red-600 text-sm">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={passwordSubmitting}>
              {passwordSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
