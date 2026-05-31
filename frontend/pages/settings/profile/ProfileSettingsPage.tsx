import { useState } from "react";

import { toast } from "sonner";

import {
  uploadAvatar,
} from "../../../services/profile";

import {
  useProfileSettings,
} from "../../../hooks/useProfileSettings";

import {
  AvatarUpload,
} from "./AvatarUpload";

import {
  ProfileSettingsForm,
} from "./ProfileSettingsForm";

import {
  EmailVerificationBanner,
} from "./EmailVerificationBanner";

export function ProfileSettingsPage() {

  const {
    profileQuery,
    updateMutation,
  } =
    useProfileSettings();

  const [
    emailChanged,
    setEmailChanged,
  ] = useState(false);

  if (
    profileQuery.isLoading
  ) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const profile =
    profileQuery.data;

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">

      <AvatarUpload
        avatarUrl={
          profile.avatarUrl
        }
        onUpload={
          uploadAvatar
        }
      />

      <EmailVerificationBanner
        visible={
          emailChanged
        }
      />

      <ProfileSettingsForm
        profile={
          profile
        }
        onEmailChanged={
          setEmailChanged
        }
        onSubmit={async (
          data
        ) => {

          await updateMutation.mutateAsync(
            data
          );

          toast.success(
            "Profile updated successfully."
          );
        }}
      />
    </div>
  );
}