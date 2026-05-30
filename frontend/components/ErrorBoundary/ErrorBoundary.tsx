import React from "react";

import {
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./types";

import {
  ErrorBoundaryContext,
} from "./ErrorBoundaryContext";

import {
  DefaultErrorFallback,
} from "./DefaultErrorFallback";

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(
    error: Error
  ) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo:
      React.ErrorInfo
  ) {
    if (
      process.env
        .NODE_ENV ===
      "development"
    ) {
      console.error(
        "ErrorBoundary caught error:",
        error
      );

      console.error(
        "Component stack:",
        errorInfo.componentStack
      );
    }
  }

  private resetBoundary =
    () => {
      this.setState({
        hasError: false,
        error: null,
      });
    };

  private showBoundary =
    (error: Error) => {
      this.setState({
        hasError: true,
        error,
      });
    };

  render() {
    if (
      this.state.hasError
    ) {
      return (
        <ErrorBoundaryContext.Provider
          value={{
            showBoundary:
              this.showBoundary,
          }}
        >
          {this.props
            .fallback ?? (
            <DefaultErrorFallback
              onRetry={
                this.resetBoundary
              }
            />
          )}
        </ErrorBoundaryContext.Provider>
      );
    }

    return (
      <ErrorBoundaryContext.Provider
        value={{
          showBoundary:
            this.showBoundary,
        }}
      >
        {this.props.children}
      </ErrorBoundaryContext.Provider>
    );
  }
}