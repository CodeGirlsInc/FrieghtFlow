import { useState } from "react";

import {
  validateAvatar,
} from "./profile.validation";

interface Props {
  avatarUrl?: string;

  onUpload: (
    file: File
  ) => Promise<void>;
}

export function AvatarUpload({
  avatarUrl,
  onUpload,
}: Props) {

  const [error, setError] =
    useState("");

  async function handleChange(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const validation =
      validateAvatar(file);

    if (validation) {
      setError(validation);
      return;
    }

    setError("");

    await onUpload(file);
  }

  return (
    <div className="space-y-3">

      <img
        src={
          avatarUrl ??
          "/default-avatar.png"
        }
        alt="Avatar"
        className="
          h-24
          w-24
          rounded-full
          object-cover
        "
      />

      <input
        type="file"
        accept="
          image/jpeg,
          image/png,
          image/webp
        "
        onChange={
          handleChange
        }
      />

      {error && (
        <p className="text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}