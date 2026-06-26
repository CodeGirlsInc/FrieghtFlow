'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { useAuthStore } from '../../../stores/auth.store';
import { cn } from '../../../lib/utils';
import PasswordStrengthBar from '../../../components/auth/PasswordStrengthBar';

// ─── Schema ──────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long')
      .regex(/^[A-Za-z\s'-]+$/, 'First name contains invalid characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long')
      .regex(/^[A-Za-z\s'-]+$/, 'Last name contains invalid characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['shipper', 'carrier'], {
      required_error: 'Please select a role',
    }),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms to continue' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Role metadata ────────────────────────────────────────────────────────────

const ROLES = [
  {
    value: 'shipper' as const,
    label: 'Shipper',
    description: 'I need to move freight',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    value: 'carrier' as const,
    label: 'Carrier',
    description: 'I haul and deliver freight',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
] as const;

// ─── Progress indicator ───────────────────────────────────────────────────────

function FormProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
          <div
            className={cn(
              'h-1.5 rounded-full transition-all duration-500',
              i === 0 ? 'flex-1' : 'flex-1',
              i < step ? 'bg-primary' : 'bg-muted',
            )}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  id,
  label,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={cn(error && 'text-destructive')}>
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1" role="alert">
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Email-sent state ─────────────────────────────────────────────────────────

function EmailSentCard({ email }: { email: string }) {
  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <CardTitle className="text-xl">Check your inbox</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          We sent a verification link to{' '}
          <span className="font-medium text-foreground">{email}</span>.
          Click it to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-center text-sm text-muted-foreground">
          Redirecting you to the dashboard…
        </p>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary rounded-full animate-[progress_2s_linear_forwards]" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, dirtyFields, touchedFields },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'shipper' },
    mode: 'onBlur',
  });

  const selectedRole = watch('role');
  const password = watch('password') ?? '';
  const watchedFields = watch(['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'role']);

  // Derive form progress from completed sections:
  // step 1 = identity, step 2 = credentials, step 3 = role + terms
  const completedIdentity =
    !!watchedFields[0] && !errors.firstName && !!watchedFields[1] && !errors.lastName;
  const completedCredentials =
    !!watchedFields[2] && !errors.email && !!watchedFields[3] && !errors.password &&
    !!watchedFields[4] && !errors.confirmPassword;
  const completedRole = !!watchedFields[5];

  const progressStep = completedIdentity && completedCredentials && completedRole
    ? 3
    : completedIdentity && completedCredentials
    ? 2
    : completedIdentity
    ? 1
    : 0;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      setSubmittedEmail(data.email);
      setEmailSent(true);
      toast.success('Account created! Check your email to verify.');
      setTimeout(() => router.push('/dashboard'), 2200);
    } catch (err: unknown) {
      const error = err as { message?: string | string[]; statusCode?: number };
      const raw = error?.message;
      const message = Array.isArray(raw)
        ? raw[0]
        : raw ?? 'Registration failed. Please try again.';

      // Surface field-level errors when the API returns 409 (email taken)
      if (error?.statusCode === 409) {
        toast.error('An account with this email already exists.', {
          action: { label: 'Sign in', onClick: () => router.push('/login') },
        });
      } else {
        toast.error(message);
      }
    }
  };

  if (emailSent) {
    return <EmailSentCard email={submittedEmail} />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription>Join FreightFlow — it takes under two minutes.</CardDescription>
        <FormProgress step={progressStep} total={3} />
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-5">

          {/* ── Name row ── */}
          <div className="grid grid-cols-2 gap-3">
            <Field id="firstName" label="First name" error={errors.firstName?.message}>
              <Input
                id="firstName"
                placeholder="John"
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                className={cn(errors.firstName && 'border-destructive focus-visible:ring-destructive/30')}
                {...register('firstName')}
              />
            </Field>
            <Field id="lastName" label="Last name" error={errors.lastName?.message}>
              <Input
                id="lastName"
                placeholder="Doe"
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                className={cn(errors.lastName && 'border-destructive focus-visible:ring-destructive/30')}
                {...register('lastName')}
              />
            </Field>
          </div>

          {/* ── Email ── */}
          <Field id="email" label="Work email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className={cn(errors.email && 'border-destructive focus-visible:ring-destructive/30')}
              {...register('email')}
            />
          </Field>

          {/* ── Password ── */}
          <Field
            id="password"
            label="Password"
            error={errors.password?.message}
            hint="At least 8 characters, one uppercase, one number."
          >
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby="password-strength"
              className={cn(errors.password && 'border-destructive focus-visible:ring-destructive/30')}
              {...register('password')}
            />
            <div id="password-strength">
              <PasswordStrengthBar password={password} />
            </div>
          </Field>

          {/* ── Confirm password ── */}
          <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              className={cn(errors.confirmPassword && 'border-destructive focus-visible:ring-destructive/30')}
              {...register('confirmPassword')}
            />
          </Field>

          {/* ── Role selector ── */}
          <fieldset>
            <legend className="text-sm font-medium mb-2.5 leading-none">
              I am a…
            </legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
              {ROLES.map((role) => {
                const selected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setValue('role', role.value, { shouldValidate: true, shouldDirty: true });
                    }}
                    className={cn(
                      'group relative flex flex-col items-start gap-2 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-background hover:border-primary/40 hover:bg-muted/40',
                    )}
                  >
                    {/* Selection indicator dot */}
                    <span
                      className={cn(
                        'absolute top-3 right-3 h-4 w-4 rounded-full border-2 transition-all duration-200',
                        selected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30 bg-transparent',
                      )}
                    >
                      {selected && (
                        <svg viewBox="0 0 16 16" fill="currentColor" className="h-full w-full text-primary-foreground p-0.5">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </span>

                    <span className={cn('transition-colors', selected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}>
                      {role.icon}
                    </span>
                    <span>
                      <span className={cn('block text-sm font-semibold', selected ? 'text-primary' : 'text-foreground')}>
                        {role.label}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {role.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.role && (
              <p className="mt-1.5 text-xs text-destructive" role="alert">
                {errors.role.message}
              </p>
            )}
          </fieldset>

          {/* ── Terms ── */}
          <div className="flex items-start gap-3">
            <input
              id="acceptTerms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary cursor-pointer"
              aria-invalid={!!errors.acceptTerms}
              {...register('acceptTerms')}
            />
            <div>
              <Label htmlFor="acceptTerms" className="cursor-pointer text-sm font-normal leading-snug">
                I agree to the{' '}
                <Link href="/terms" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  Privacy Policy
                </Link>
              </Label>
              {errors.acceptTerms && (
                <p className="mt-0.5 text-xs text-destructive" role="alert">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Creating your account…
              </span>
            ) : (
              'Create account'
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}