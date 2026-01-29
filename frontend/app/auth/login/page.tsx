"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "../../../lib/schemas/auth";
import { authApi, getAuthErrorMessage } from "../../../lib/auth-api";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNotify } from "../../../store/useNotificationStore";
import AuthCard from "../../../components/auth/AuthCard";

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema as any),
  });
  const auth = useAuthStore();

  const notify = useNotify();

  async function onSubmit(data: LoginSchema) {
    try {
      const res = await authApi.login({ email: data.email, password: data.password });
      // Persist token for api client compatibility and update store
      try {
        localStorage.setItem("auth_token", res.access_token);
      } catch {}

      auth.login(res.user ?? null, res.access_token, null as unknown as string);
      notify.success("Signed in");
      router.push("/");
    } catch (err) {
      console.error(err);
      notify.error(getAuthErrorMessage(err));
    }
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input {...register("email")} className="mt-1 block w-full border rounded px-3 py-2" />
          {formState.errors.email && (
            <p className="text-sm text-red-500">{formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" {...register("password")} className="mt-1 block w-full border rounded px-3 py-2" />
          {formState.errors.password && (
            <p className="text-sm text-red-500">{formState.errors.password.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
