import { AdminActivityFeedDemo } from '../components/AdminActivityFeedDemo';

export default function AdminActivityPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Admin Activity Feed</h1>
        <p className="mb-8 text-sm text-gray-500">
          Real-time platform event feed — auto-refreshes every 30 seconds
        </p>
        <AdminActivityFeedDemo />
      </div>
    </main>
  );
}
