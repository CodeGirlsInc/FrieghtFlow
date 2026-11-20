/**
 * Shared auth form validation.
 *
 * Password rules mirror the backend `@IsStrongPassword()` decorator so the
 * form rejects passwords the server would reject before the round-trip.
 * Rules and messages are defined once in PASSWORD_RULES so they can be shared
 * with PasswordStrengthBar without drifting.
 *
 * The email and password rules below used to be copy-pasted into every auth
 * page, which meant a password-policy change had to be made in up to four
 * places and the copies had already started to drift. They live here now so
 * there is exactly one place to change.
 *
 * Rules and messages that differ per form are modelled explicitly rather than
 * flattened: `changePasswordSchema` keeps its own "New password must be at
 * least 8 characters" wording, which is distinct from `passwordSchema`.
 */

import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;

/** Individual password rule definitions shared with PasswordStrengthBar. */
export const PASSWORD_RULES = [
  {
    key: 'minLength',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (v: string) => v.length >= PASSWORD_MIN_LENGTH,
  },
  {
    key: 'uppercase',
    label: 'At least one uppercase letter',
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    key: 'lowercase',
    label: 'At least one lowercase letter',
    test: (v: string) => /[a-z]/.test(v),
  },
  {
    key: 'digit',
    label: 'At least one digit',
    test: (v: string) => /[0-9]/.test(v),
  },
  {
    key: 'special',
    label: 'At least one special character',
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

export const emailSchema = z.string().email('Invalid email address');

/**
 * Password schema that matches backend `@IsStrongPassword()` rules:
 * min 8 chars, uppercase, lowercase, digit, special character.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .refine((v) => /[A-Z]/.test(v), 'Password must contain at least one uppercase letter')
  .refine((v) => /[a-z]/.test(v), 'Password must contain at least one lowercase letter')
  .refine((v) => /[0-9]/.test(v), 'Password must contain at least one digit')
  .refine((v) => /[^A-Za-z0-9]/.test(v), 'Password must contain at least one special character');

/** `app/(auth)/login` */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginFormData = z.infer<typeof loginSchema>;

/** `app/(auth)/register` */
export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['shipper', 'carrier']),
});
export type RegisterFormData = z.infer<typeof registerSchema>;

/** `app/(auth)/forgot-password` */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * `app/(dashboard)/settings` — change password.
 *
 * Kept separate from `loginSchema`: the current-password field only has to be
 * non-empty, and the new-password message deliberately reads "New password…"
 * rather than the shared "Password…".
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
