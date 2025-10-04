"use client";

import { useNotify } from "@/store/useNotificationStore";
import { Button } from "@/components/ui/button";

export default function NotificationsDemoPage() {
  const notify = useNotify();

  const handleSuccess = () => {
    notify.success("Saved!", "Your changes have been saved successfully.");
  };

  const handleError = () => {
    notify.error(
      "Error occurred",
      "Something went wrong. Please try again."
    );
  };

  const handleInfo = () => {
    notify.info("New feature available", "Check out our latest updates.");
  };

  const handleWarning = () => {
    notify.warning(
      "Session expiring soon",
      "Your session will expire in 5 minutes."
    );
  };

  const handleLoading = () => {
    const loadingId = notify.loading("Processing...", "Please wait");
    
    // Simulate async operation
    setTimeout(() => {
      notify.dismiss(loadingId);
      notify.success("Done!", "Operation completed successfully");
    }, 3000);
  };

  const handleMultiple = () => {
    notify.success("First notification");
    setTimeout(() => notify.info("Second notification"), 500);
    setTimeout(() => notify.warning("Third notification"), 1000);
    setTimeout(() => notify.error("Fourth notification"), 1500);
  };

  const handlePromise = () => {
    const simulateAsyncOperation = () => {
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.5;
          if (success) {
            resolve("Data loaded successfully");
          } else {
            reject(new Error("Failed to load data"));
          }
        }, 2000);
      });
    };

    notify.promise(simulateAsyncOperation(), {
      loading: "Loading data...",
      success: (data) => data,
      error: (error) => error.message,
    });
  };

  const handleCustomDuration = () => {
    notify.success("Quick notification", "This will disappear in 2 seconds", 2000);
  };

  const handleDismissAll = () => {
    notify.dismissAll();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Notification System Demo</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test the global notification system using Sonner and Zustand
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Notifications */}
          <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Types</h2>
            <Button
              onClick={handleSuccess}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Success
            </Button>
            <Button
              onClick={handleError}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Error
            </Button>
            <Button
              onClick={handleInfo}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Info
            </Button>
            <Button
              onClick={handleWarning}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              Warning
            </Button>
          </div>

          {/* Advanced Features */}
          <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Advanced</h2>
            <Button
              onClick={handleLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Loading State
            </Button>
            <Button
              onClick={handlePromise}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Promise-based
            </Button>
            <Button
              onClick={handleCustomDuration}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              Custom Duration
            </Button>
            <Button
              onClick={handleMultiple}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Multiple Queue
            </Button>
          </div>

          {/* Actions */}
          <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <Button
              onClick={handleDismissAll}
              variant="outline"
              className="w-full"
            >
              Dismiss All
            </Button>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded font-mono text-sm">
              <div className="text-gray-500 mb-2">// Import the hook</div>
              <code>const notify = useNotify();</code>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded font-mono text-sm">
              <div className="text-gray-500 mb-2">// Show success notification</div>
              <code>notify.success(&quot;Saved!&quot;);</code>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded font-mono text-sm">
              <div className="text-gray-500 mb-2">// With description</div>
              <code>notify.error(&quot;Error&quot;, &quot;Something went wrong&quot;);</code>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded font-mono text-sm">
              <div className="text-gray-500 mb-2">// Custom duration (ms)</div>
              <code>notify.info(&quot;Message&quot;, &quot;Description&quot;, 3000);</code>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded font-mono text-sm">
              <div className="text-gray-500 mb-2">// Promise-based for async operations</div>
              <code>{`notify.promise(fetchData(), {
  loading: "Loading...",
  success: "Data loaded!",
  error: "Failed to load"
});`}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

