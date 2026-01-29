import React from "react";
import type { ReactNode } from "react";

export const metadata = {
  title: "Auth",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}
