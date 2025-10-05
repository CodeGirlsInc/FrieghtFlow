import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800 px-6 text-center">
      <div className="max-w-xl">
    
        <h1 className="text-7xl font-extrabold text-blue-600 mb-4">404</h1>

        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
          Oops! Page not found.
        </h2>

        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <ul className="text-gray-500 text-sm mb-8 space-y-1">
          <li>• Check the URL for typos</li>
          <li>• Try refreshing the page</li>
          <li>• Go back to the homepage</li>
        </ul>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <a className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Go Home
            </a>
          </Link>
          <Link href="/contact">
            <a className="px-5 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-200 transition-colors">
              Contact Support
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
