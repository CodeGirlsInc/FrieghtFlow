"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">FreightFlow</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to FreightFlow Application
        </p>

        <Link
          href="/input"
          className="inline-block bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          View Input Component
        </Link>
      </div>
    </div>
  );
}
