"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Package, ArrowRight, Users, TrendingUp } from "lucide-react";

export default function NewHome() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 text-white shadow-lg shadow-black">
      <header className="bg-white bg-opacity-20 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-black mr-2" />
              <h1 className="text-2xl font-bold text-black">FreightFlow</h1>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-black/80">
                    Welcome, {user?.name}
                  </span>
                  <Link
                    href="/dashboard"
                    className="bg-black bg-opacity-30 text-black px-4 py-2 rounded-md hover:bg-opacity-50 transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-black hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-black bg-opacity-30 text-white px-4 py-2 rounded-md hover:bg-opacity-50 transition-colors text-sm font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold sm:text-6xl md:text-7xl leading-tight">
            Streamline Your
            <span className="text-yellow-300"> Freight Operations</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg sm:text-xl md:mt-6 md:text-2xl md:max-w-4xl text-white/90">
            Comprehensive logistics management platform for modern freight
            operations. Track shipments, optimize routes, and manage your supply
            chain with ease.
          </p>

          <div className="mt-8 max-w-2xl mx-auto sm:flex sm:justify-center md:mt-10">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-md text-yellow-300 bg-white bg-opacity-20 hover:bg-opacity-40 md:px-10 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            ) : (
              <div className="flex justify-center flex-col md:flex-row max-w-2xl w-full gap-4">
                <Link
                  href="/register"
                  className="flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-md text-yellow-300 bg-white bg-opacity-20 hover:bg-opacity-40 md:px-10 transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
                <Link
                  href="/input"
                  className="flex items-center justify-center px-8 py-4 border border-yellow-300 text-lg font-semibold rounded-md text-yellow-300 bg-transparent hover:bg-yellow-300 hover:text-white md:px-10 transition-colors"
                >
                  View Demo
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-24">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-300 text-purple-900 mx-auto shadow-lg">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="mt-8 text-xl font-semibold text-white">
                Shipment Tracking
              </h3>
              <p className="mt-4 text-white/90 max-w-xs mx-auto">
                Real-time tracking and monitoring of all your shipments with
                detailed analytics.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-300 text-purple-900 mx-auto shadow-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="mt-8 text-xl font-semibold text-white">
                Route Optimization
              </h3>
              <p className="mt-4 text-white/90 max-w-xs mx-auto">
                AI-powered route optimization to reduce costs and improve
                delivery times.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-300 text-purple-900 mx-auto shadow-lg">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mt-8 text-xl font-semibold text-white">
                Customer Management
              </h3>
              <p className="mt-4 text-white/90 max-w-xs mx-auto">
                Comprehensive customer relationship management with integrated
                communication tools.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
