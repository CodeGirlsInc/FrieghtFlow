"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordSchema } from "../../../lib/schemas/auth";
import { authApi, getAuthErrorMessage } from "../../../lib/auth-api";
import { useNotify } from "../../../store/useNotificationStore";
import AuthCard from "../../../components/auth/AuthCard";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params?.get("token") ?? "";

  const { register, handleSubmit, formState } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema as any),
    defaultValues: { token },
  });

  const notify = useNotify();

  async function onSubmit(data: ResetPasswordSchema) {
    try {
      await authApi.resetPassword({ token: data.token, password: data.password });
      notify.success("Password updated. Please sign in.");
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
      notify.error(getAuthErrorMessage(err));
    }
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-semibold mb-4">Set a new password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} />

        <div>
          <label className="block text-sm font-medium">New password</label>
          <input type="password" {...register("password")} className="mt-1 block w-full border rounded px-3 py-2" />
          {formState.errors.password && (
            <p className="text-sm text-red-500">{formState.errors.password.message}</p>
          )}
        </div>

        <div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
