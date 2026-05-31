export const MAX_BIO_LENGTH = 300;

export const MAX_AVATAR_SIZE =
  2 * 1024 * 1024;

export const ACCEPTED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function validateAvatar(
  file: File
): string | null {

  if (
    !ACCEPTED_AVATAR_TYPES.includes(
      file.type
    )
  ) {
    return (
      "Only JPG, PNG and WebP files are allowed."
    );
  }

  if (
    file.size >
    MAX_AVATAR_SIZE
  ) {
    return (
      "Avatar must be smaller than 2MB."
    );
  }

  return null;
}