import {
  useContext,
} from "react";

import {
  ErrorBoundaryContext,
} from "./ErrorBoundaryContext";

export function useErrorBoundary() {

  const context =
    useContext(
      ErrorBoundaryContext
    );

  if (!context) {
    throw new Error(
      "useErrorBoundary must be used inside ErrorBoundary"
    );
  }

  return context;
}