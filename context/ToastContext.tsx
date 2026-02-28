"use client";

import React, { createContext, useContext, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type Toast = {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
};

type ToastContextType = {
  addToast: (
    message: string,
    type?: "success" | "error" | "info",
    duration?: number
  ) => void;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
    duration: number = 4000
  ) => {
    const newToast = { id: Date.now(), message, type, duration };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after specified duration
    setTimeout(() => {
      removeToast(newToast.id);
    }, duration);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-white border-l-4 border-green-500 text-gray-900 shadow-lg";
      case "error":
        return "bg-white border-l-4 border-red-500 text-gray-900 shadow-lg";
      case "info":
      default:
        return "bg-white border-l-4 border-blue-500 text-gray-900 shadow-lg";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "info":
      default:
        return "text-blue-500";
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              ${getToastStyles(toast.type || "info")}
              rounded-lg p-4 pr-8 relative
              transform transition-all duration-300 ease-in-out
              animate-in slide-in-from-right-full
              hover:shadow-xl
            `}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className={`shrink-0 ${getIconColor(toast.type || "info")}`}>
                {getToastIcon(toast.type || "info")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-5">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
