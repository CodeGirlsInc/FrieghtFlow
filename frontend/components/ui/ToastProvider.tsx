"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Toast, ToastType } from "./Toast";

interface ToastOptions {
  type?: ToastType;
  duration?: number; // in ms
  isPersistent?: boolean;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<
    {
      id: string;
      message: string;
      type?: ToastType;
      isPersistent?: boolean;
      duration?: number;
    }[]
  >([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (
      message: string,
      {
        type = "info",
        duration = 3000,
        isPersistent = false,
      }: ToastOptions = {}
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type, isPersistent, duration };
      setToasts((prev) => [...prev, newToast]);

      if (!isPersistent) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              isPersistent={toast.isPersistent}
              onDismiss={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
