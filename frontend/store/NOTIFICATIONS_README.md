# Notification System

A global notification handler that integrates Sonner toast component with Zustand state management for showing success/error/info/warning messages throughout the application.

## Features

- ✅ Global notification system accessible from anywhere in the app
- ✅ Support for multiple notification types (success, error, info, warning, loading)
- ✅ Automatic queuing of multiple notifications
- ✅ Promise-based notifications for async operations
- ✅ Customizable duration and descriptions
- ✅ Beautiful UI with Sonner toast library
- ✅ Type-safe with TypeScript

## Installation

The notification system uses the following dependencies (already installed):

```json
{
  "sonner": "^2.0.7",
  "zustand": "^5.0.8"
}
```

## Setup

The Toaster component is already integrated in `app/layout.tsx`:

```tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster 
          position="top-right" 
          expand={false}
          richColors
          closeButton
          duration={4000}
        />
      </body>
    </html>
  );
}
```

## Usage

### Basic Usage

Import the `useNotify` hook in any component:

```tsx
"use client";

import { useNotify } from "@/store/useNotificationStore";

export default function MyComponent() {
  const notify = useNotify();

  const handleSave = () => {
    notify.success("Saved!");
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Notification Types

#### Success

```tsx
notify.success("Operation successful!");
notify.success("Saved!", "Your changes have been saved successfully.");
```

#### Error

```tsx
notify.error("Something went wrong");
notify.error("Error occurred", "Please try again later.");
```

#### Info

```tsx
notify.info("New update available");
notify.info("Info", "Check out our latest features.");
```

#### Warning

```tsx
notify.warning("Session expiring soon");
notify.warning("Warning", "Your session will expire in 5 minutes.");
```

#### Loading

```tsx
const loadingId = notify.loading("Processing...");
// Later dismiss it
notify.dismiss(loadingId);
```

### Advanced Features

#### Custom Duration

```tsx
// Show notification for 2 seconds
notify.success("Quick message", "This disappears in 2s", 2000);
```

#### Promise-based Notifications

Perfect for async operations:

```tsx
const saveData = async () => {
  const promise = fetch("/api/save", { method: "POST" });
  
  notify.promise(promise, {
    loading: "Saving...",
    success: "Data saved successfully!",
    error: "Failed to save data"
  });
};
```

With dynamic messages:

```tsx
notify.promise(fetchUser(), {
  loading: "Loading user...",
  success: (user) => `Welcome, ${user.name}!`,
  error: (error) => `Error: ${error.message}`
});
```

#### Multiple Notifications (Queuing)

```tsx
const handleMultiple = () => {
  notify.success("First notification");
  notify.info("Second notification");
  notify.warning("Third notification");
  // All will queue and display properly
};
```

#### Dismiss Notifications

```tsx
// Dismiss specific notification
const id = notify.success("Message");
notify.dismiss(id);

// Dismiss all notifications
notify.dismissAll();
```

## API Reference

### `useNotify()`

Returns an object with the following methods:

| Method | Parameters | Description |
|--------|-----------|-------------|
| `success(message, description?, duration?)` | message: string, description?: string, duration?: number | Show success notification |
| `error(message, description?, duration?)` | message: string, description?: string, duration?: number | Show error notification |
| `info(message, description?, duration?)` | message: string, description?: string, duration?: number | Show info notification |
| `warning(message, description?, duration?)` | message: string, description?: string, duration?: number | Show warning notification |
| `loading(message, description?)` | message: string, description?: string | Show loading notification |
| `dismiss(id)` | id: string | Dismiss specific notification |
| `dismissAll()` | - | Dismiss all notifications |
| `promise(promise, options)` | promise: Promise, options: {loading, success, error} | Handle promise-based notifications |

### `useNotificationStore`

The underlying Zustand store (typically not used directly):

```tsx
import { useNotificationStore } from "@/store/useNotificationStore";

const notifications = useNotificationStore((state) => state.notifications);
const addNotification = useNotificationStore((state) => state.addNotification);
const clearAll = useNotificationStore((state) => state.clearAll);
```

## Examples

### Form Submission

```tsx
const handleSubmit = async (data) => {
  try {
    await submitForm(data);
    notify.success("Form submitted!", "We'll get back to you soon.");
  } catch (error) {
    notify.error("Submission failed", error.message);
  }
};
```

### With Loading State

```tsx
const handleUpload = async (file) => {
  const loadingId = notify.loading("Uploading file...");
  
  try {
    await uploadFile(file);
    notify.dismiss(loadingId);
    notify.success("Upload complete!");
  } catch (error) {
    notify.dismiss(loadingId);
    notify.error("Upload failed", error.message);
  }
};
```

### API Integration

```tsx
const deleteItem = async (id: string) => {
  const promise = fetch(`/api/items/${id}`, { method: "DELETE" });
  
  notify.promise(promise, {
    loading: "Deleting item...",
    success: "Item deleted successfully",
    error: "Failed to delete item"
  });
};
```

## Demo

Visit `/notifications-demo` to see all notification types in action and explore usage examples.

## Customization

### Toaster Configuration

You can customize the Toaster component in `app/layout.tsx`:

```tsx
<Toaster 
  position="top-right"        // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
  expand={false}              // Whether to expand on hover
  richColors                  // Use rich colors for different types
  closeButton                 // Show close button
  duration={4000}             // Default duration in ms
  visibleToasts={5}           // Max visible toasts
  theme="system"              // light, dark, or system
/>
```

### Custom Styling

Sonner uses CSS variables that can be customized in your `globals.css`:

```css
:root {
  --toast-bg: white;
  --toast-border: #e5e7eb;
  --toast-color: #374151;
}
```

## Best Practices

1. **Use descriptive messages**: Make notifications clear and actionable
2. **Add descriptions for context**: Provide additional information when needed
3. **Choose appropriate types**: Use the correct type for better UX
4. **Handle loading states**: Show loading notifications for async operations
5. **Don't overuse**: Avoid notification fatigue by using them sparingly
6. **Test queuing**: Ensure multiple notifications display properly

## Troubleshooting

### Notifications not showing

1. Ensure Toaster is added to your root layout
2. Check that you're using `"use client"` in components using the hook
3. Verify Sonner is installed: `npm install sonner`

### TypeScript errors

Make sure you're importing from the correct path:

```tsx
import { useNotify } from "@/store/useNotificationStore";
```

## Support

For issues or questions, refer to:
- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

