'use client';

import { useToast } from "@/components/shared/ui/toast";

export default function Home() {
  const { showToast } = useToast();

  return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-white text-4xl font-bold">Diabetes Treatment System</h1>

          {/* Test Toast Buttons */}
          <div className="flex gap-4">
            <button
                onClick={() => showToast('Success!', 'Operation completed successfully', 'success')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              Test Success Toast
            </button>

            <button
                onClick={() => showToast('Error!', 'Something went wrong', 'error')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Test Error Toast
            </button>

            <button
                onClick={() => showToast('Info', 'Here is some information', 'info')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Test Info Toast
            </button>
          </div>
        </div>
      </div>
  );
}