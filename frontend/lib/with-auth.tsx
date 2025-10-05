"use client";

import React, { useEffect, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Options for withAuth HOC
export interface WithAuthOptions {
  redirectTo?: string;
  loadingComponent?: ComponentType;
  requireAuth?: boolean;
}

// Higher-order component for authentication
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = "/login",
    loadingComponent: LoadingComponent = LoadingSpinner,
    requireAuth = true,
  } = options;

  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Don't redirect while loading
      if (isLoading) return;

      // If authentication is required and user is not authenticated
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // If authentication is not required and user is authenticated (for guest pages)
      if (!requireAuth && isAuthenticated) {
        router.push("/dashboard");
        return;
      }
    }, [isAuthenticated, isLoading, router]);

    // Show loading spinner while checking authentication
    if (isLoading) {
      return <LoadingComponent />;
    }

    // If authentication is required but user is not authenticated, don't render
    if (requireAuth && !isAuthenticated) {
      return <LoadingComponent />;
    }

    // If authentication is not required but user is authenticated (guest pages), don't render
    if (!requireAuth && isAuthenticated) {
      return <LoadingComponent />;
    }

    // Render the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return AuthenticatedComponent;
}

// Convenience function for protecting routes (requires authentication)
export function withAuthRequired<P extends object>(
  WrappedComponent: ComponentType<P>,
  redirectTo?: string
) {
  return withAuth(WrappedComponent, {
    requireAuth: true,
    redirectTo,
  });
}

// Convenience function for guest routes (redirects if authenticated)
export function withGuest<P extends object>(
  WrappedComponent: ComponentType<P>,
  redirectTo?: string
) {
  return withAuth(WrappedComponent, {
    requireAuth: false,
    redirectTo: redirectTo || "/dashboard",
  });
}

// Hook to check if user has specific permissions (for future use)
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = (_permission: string): boolean => {
    if (!isAuthenticated || !user) return false;

    // Add your permission logic here
    // For now, just return true for authenticated users
    return true;
  };

  const hasRole = (_role: string): boolean => {
    if (!isAuthenticated || !user) return false;

    // Add your role logic here
    // For now, just return true for authenticated users
    return true;
  };

  return {
    hasPermission,
    hasRole,
  };
}

// HOC for role-based access control (for future use)
export function withRole<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredRole: string,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = "/unauthorized",
    loadingComponent: LoadingComponent = LoadingSpinner,
  } = options;

  const RoleProtectedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const { hasRole } = usePermissions();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (!hasRole(requiredRole)) {
        router.push(redirectTo);
        return;
      }
    }, [isAuthenticated, isLoading, router, hasRole]);

    if (isLoading) {
      return <LoadingComponent />;
    }

    if (!isAuthenticated || !hasRole(requiredRole)) {
      return <LoadingComponent />;
    }

    return <WrappedComponent {...props} />;
  };

  RoleProtectedComponent.displayName = `withRole(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return RoleProtectedComponent;
}
