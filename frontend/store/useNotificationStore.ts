import { create } from "zustand";
import { toast } from "sonner";

type NotificationType = "success" | "error" | "info" | "warning" | "loading";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newNotification = { ...notification, id };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Trigger the appropriate Sonner toast based on type
    const { type, message, description, duration = 4000 } = notification;

    switch (type) {
      case "success":
        toast.success(message, {
          description,
          duration,
          id,
        });
        break;
      case "error":
        toast.error(message, {
          description,
          duration,
          id,
        });
        break;
      case "info":
        toast.info(message, {
          description,
          duration,
          id,
        });
        break;
      case "warning":
        toast.warning(message, {
          description,
          duration,
          id,
        });
        break;
      case "loading":
        toast.loading(message, {
          description,
          id,
        });
        break;
      default:
        toast(message, {
          description,
          duration,
          id,
        });
    }

    // Auto-remove from store after duration (except loading)
    if (type !== "loading") {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeNotification: (id) => {
    toast.dismiss(id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    toast.dismiss();
    set({ notifications: [] });
  },
}));

/**
 * Hook for easy notification usage across the app
 * 
 * @example
 * const notify = useNotify();
 * notify.success("Operation completed!");
 * notify.error("Something went wrong", "Please try again later");
 * notify.info("New update available");
 * notify.warning("Your session will expire soon");
 */
export const useNotify = () => {
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification
  );
  const clearAll = useNotificationStore((state) => state.clearAll);

  return {
    success: (message: string, description?: string, duration?: number) =>
      addNotification({ type: "success", message, description, duration }),

    error: (message: string, description?: string, duration?: number) =>
      addNotification({ type: "error", message, description, duration }),

    info: (message: string, description?: string, duration?: number) =>
      addNotification({ type: "info", message, description, duration }),

    warning: (message: string, description?: string, duration?: number) =>
      addNotification({ type: "warning", message, description, duration }),

    loading: (message: string, description?: string) =>
      addNotification({ type: "loading", message, description }),

    dismiss: (id: string) => removeNotification(id),

    dismissAll: () => clearAll(),

    // Promise-based notification for async operations
    promise: <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ) => {
      return toast.promise(promise, options);
    },
  };
};

