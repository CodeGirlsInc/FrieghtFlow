/**
 * Shared auth form validation.
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

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, 'Password must be at least 8 characters');

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
    newPassword: z.string().min(PASSWORD_MIN_LENGTH, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
