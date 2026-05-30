export interface UserProfile {
  id: string;

  firstName: string;
  lastName: string;

  email: string;

  phoneNumber: string;

  bio: string;

  avatarUrl?: string;

  emailVerified: boolean;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bio: string;
}