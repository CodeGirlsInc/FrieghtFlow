"use client";

import React, { PropsWithChildren } from "react";

export default function AuthCard({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        {children}
      </div>
    </div>
  );
}
