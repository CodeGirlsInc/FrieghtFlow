import {
  UpdateProfilePayload,
  UserProfile,
} from "../pages/settings/Profile/profile.types";

export async function getProfile() {
  const response =
    await fetch(
      "/api/auth/me"
    );

  if (!response.ok) {
    throw new Error(
      "Failed to load profile"
    );
  }

  return response.json() as Promise<UserProfile>;
}

export async function updateProfile(
  payload: UpdateProfilePayload
) {
  const response =
    await fetch(
      "/api/users/me",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to update profile"
    );
  }

  return response.json();
}

export async function uploadAvatar(
  file: File
) {
  const formData =
    new FormData();

  formData.append(
    "avatar",
    file
  );

  const response =
    await fetch(
      "/api/users/me/avatar",
      {
        method: "POST",
        body: formData,
      }
    );

  if (!response.ok) {
    throw new Error(
      "Avatar upload failed"
    );
  }

  return response.json();
}