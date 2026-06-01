"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { resendVerificationEmail } from "@/lib/api/auth.api";

const COOLDOWN_SECONDS = 60;
const SESSION_STORAGE_KEY = "email-banner-dismissed";

export interface EmailVerificationBannerProps {
  onDismiss?: () => void;
}

export function EmailVerificationBanner({
  onDismiss,
}: EmailVerificationBannerProps) {
  const { user, fetchCurrentUser } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isSessionDismissed = useCallback(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === "true";
  }, []);

  // Check if banner should be shown
  const shouldShow = user && !user.isEmailVerified && !isSessionDismissed();

  // Countdown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // Listen for storage events (in case user verifies email in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "email-verified") {
        fetchCurrentUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchCurrentUser]);

  const handleDismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
    }
    onDismiss?.();
  }, [onDismiss]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setMessage(null);

    try {
      await resendVerificationEmail();
      setMessage({
        type: "success",
        text: "Verification email sent! Please check your inbox.",
      });
      setCooldown(COOLDOWN_SECONDS);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "message" in error
          ? error.message
          : "Failed to send verification email. Please try again.";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  }, [cooldown, isResending]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="relative bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-amber-600 hover:text-amber-800 transition-colors"
        aria-label="Dismiss banner"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            Verify your email address
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            Your email <span className="font-medium">{user?.email}</span> has
            not been verified. Please check your inbox for the verification
            link. Some features may be restricted until you verify your email.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                cooldown > 0 || isResending
                  ? "bg-amber-200 text-amber-600 cursor-not-allowed"
                  : "bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              }`}
            >
              {isResending
                ? "Sending..."
                : cooldown > 0
                  ? `Resend available in ${cooldown}s`
                  : "Resend Verification Email"}
            </button>

            {message && (
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
