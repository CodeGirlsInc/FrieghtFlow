"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "../../../lib/schemas/auth";
import { authApi, getAuthErrorMessage } from "../../../lib/auth-api";
import { useNotify } from "../../../store/useNotificationStore";
import AuthCard from "../../../components/auth/AuthCard";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema as any),
  });

  const notify = useNotify();

  async function onSubmit(data: ForgotPasswordSchema) {
    try {
      await authApi.forgotPassword({ email: data.email });
      notify.success("If that email exists, a reset link was sent.");
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
      notify.error(getAuthErrorMessage(err));
    }
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-semibold mb-4">Reset your password</h1>
      <p className="text-sm text-gray-600 mb-4">Enter your account email and we'll send reset instructions.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input {...register("email")} className="mt-1 block w-full border rounded px-3 py-2" />
          {formState.errors.email && (
            <p className="text-sm text-red-500">{formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <button type="submit" className="w-full bg-yellow-600 text-white py-2 rounded" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
