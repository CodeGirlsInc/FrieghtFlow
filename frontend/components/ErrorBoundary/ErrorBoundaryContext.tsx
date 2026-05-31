import {
  createContext,
} from "react";

export interface ErrorBoundaryContextValue {
  showBoundary: (
    error: Error
  ) => void;
}

export const ErrorBoundaryContext =
  createContext<
    ErrorBoundaryContextValue | null
  >(null);