const MAX_FILE_SIZE =
  5 * 1024 * 1024;

export function validateCertificationFile(
  file: File
) {
  if (
    file.type !== "application/pdf"
  ) {
    return "Only PDF files are allowed.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Maximum file size is 5MB.";
  }

  return null;
}