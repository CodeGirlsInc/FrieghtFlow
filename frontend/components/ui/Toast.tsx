"use client";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  onDismiss: (id: string) => void;
  isPersistent?: boolean;
}

const typeStyles: Record<ToastType, string> = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
};

export function Toast({ id, message, type = "info", onDismiss, isPersistent }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center justify-between w-full max-w-sm p-4 mb-2 rounded-lg shadow-lg ${typeStyles[type]}`}
    >
      <span className="text-sm font-medium">{message}</span>
      {!isPersistent && (
        <button
          onClick={() => onDismiss(id)}
          className="ml-3 rounded hover:bg-black/20 p-1 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
