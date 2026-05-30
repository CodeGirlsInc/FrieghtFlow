import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  UpdateProfilePayload,
  UserProfile,
} from "./profile.types";

interface Props {
  profile: UserProfile;

  onSubmit: (
    data: UpdateProfilePayload
  ) => void;

  onEmailChanged: (
    changed: boolean
  ) => void;
}

export function ProfileSettingsForm({
  profile,
  onSubmit,
  onEmailChanged,
}: Props) {

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState,
  } = useForm<
    UpdateProfilePayload
  >();

  useEffect(() => {
    reset({
      firstName:
        profile.firstName,
      lastName:
        profile.lastName,
      email:
        profile.email,
      phoneNumber:
        profile.phoneNumber,
      bio: profile.bio,
    });
  }, [profile, reset]);

  const email =
    watch("email");

  useEffect(() => {
    onEmailChanged(
      email !==
        profile.email
    );
  }, [
    email,
    profile.email,
    onEmailChanged,
  ]);

  useEffect(() => {
    const handler = (
      event:
        BeforeUnloadEvent
    ) => {

      if (
        !formState.isDirty
      ) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handler
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handler
      );
    };
  }, [
    formState.isDirty,
  ]);

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-4"
    >
      <input
        {...register(
          "firstName"
        )}
      />

      <input
        {...register(
          "lastName"
        )}
      />

      <input
        type="email"
        {...register(
          "email"
        )}
      />

      <input
        {...register(
          "phoneNumber"
        )}
      />

      <textarea
        maxLength={300}
        {...register("bio")}
      />

      <button
        type="submit"
      >
        Save Changes
      </button>
    </form>
  );
}