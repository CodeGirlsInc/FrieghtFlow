'use client';

import { cn } from '../../lib/utils';

interface PasswordStrengthBarProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  label: 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
}

function getStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: 'Weak', color: 'bg-red-500' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-orange-400' };
  if (score === 4) return { score, label: 'Strong', color: 'bg-green-500' };
  return { score, label: 'Very Strong', color: 'bg-green-600' };
}

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { score, label, color } = getStrength(password);
  const segments = 4;
  const filled = Math.min(Math.ceil((score / 5) * segments), segments);

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i < filled ? color : 'bg-muted',
            )}
          />
        ))}
      </div>
      {password && (
        <p className={cn('text-xs font-medium', {
          'text-red-500': label === 'Weak',
          'text-orange-400': label === 'Fair',
          'text-green-500': label === 'Strong',
          'text-green-600': label === 'Very Strong',
        })}>
          {label}
        </p>
      )}
    </div>
  );
}
