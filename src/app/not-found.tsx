import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            404
          </h1>
          <p className="text-2xl font-light text-gray-600 dark:text-gray-400">
            Page Not Found
          </p>
        </div>
        <div className="mb-8">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
          <div className="animate-bounce">
            <svg
              className="mx-auto h-16 w-16 text-gray-700 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <Link
          href="/"
          className="inline-block bg-zinc-800 hover:bg-zinc-900 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
