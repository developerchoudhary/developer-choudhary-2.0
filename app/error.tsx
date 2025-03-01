"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

/**
 * Error boundary component to handle and display errors gracefully.
 *
 * @param {ErrorProps} props - Component props.
 * @param {Error} props.error - The caught error instance.
 * @param {Function} props.reset - Function to reset the error boundary and attempt a re-render.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service or console
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
      <h2 className="text-2xl font-semibold text-red-600">
        Something went wrong!
      </h2>
      <button
        onClick={reset}
        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        Try Again
      </button>
    </div>
  );
}
