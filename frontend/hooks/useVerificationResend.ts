import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { resendVerificationEmail } from '../lib/api/auth.api';
import { getErrorMessage } from '../lib/api/client';

const RESEND_COOLDOWN_MS = 60_000;
const STORAGE_KEY = 'verificationResendAt';

function readRemainingSeconds(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const sentAt = Number(window.sessionStorage.getItem(STORAGE_KEY));
    if (!Number.isFinite(sentAt) || sentAt <= 0) return 0;
    return Math.max(0, Math.ceil((sentAt - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

function storeResendTime(deadline: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(deadline));
  } catch {
    return;
  }
}

export function useVerificationResend(onSuccess?: () => void) {
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setCooldown(readRemainingSeconds());
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown(readRemainingSeconds());
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const resend = useCallback(async () => {
    if (sending || cooldown > 0) return;
    setSending(true);
    try {
      await resendVerificationEmail();
      storeResendTime(Date.now() + RESEND_COOLDOWN_MS);
      setCooldown(RESEND_COOLDOWN_MS / 1000);
      toast.success('Verification email sent. Check your inbox.');
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err) ??
          'Could not send verification email. Please try again.',
      );
    } finally {
      setSending(false);
    }
  }, [sending, cooldown, onSuccess]);

  return {
    resend,
    sending,
    cooldown,
    disabled: sending || cooldown > 0,
    label: sending
      ? 'Sending…'
      : cooldown > 0
        ? `Resend in ${cooldown}s`
        : 'Resend email',
  };
}
