"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authApi, getAuthErrorMessage } from "./auth-api";

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
}

export type UserRole = "SHIPPER" | "CARRIER" | "DISPATCHER";

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("auth_user");

        if (token && userStr) {
          const user = JSON.parse(userStr);
          setState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const data = await authApi.login({ email, password });
      const { access_token, user } = data;

      // Store in localStorage
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("auth_user", JSON.stringify(user));

      setState({
        user,
        token: access_token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error(getAuthErrorMessage(error));
    }
  };

  // Register function
  const register = async (
    email: string,
    password: string,
    name?: string
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      await authApi.register({ email, password, name });

      // After successful registration, automatically log in
      await login(email, password);
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error(getAuthErrorMessage(error));
    }
  };

  // Logout function
  const logout = () => {
    try {
      authApi.logout().catch(() => {});
    } catch {}

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No token available");
      }

      const data = await authApi.refreshToken(token);
      const { access_token } = data;

      localStorage.setItem("auth_token", access_token);
      setState((prev) => ({
        ...prev,
        token: access_token,
      }));
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
