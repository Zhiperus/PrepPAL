import { FiAlertTriangle } from 'react-icons/fi';
import { LuRefreshCw } from 'react-icons/lu';

interface MainErrorFallbackProps {
  error?: Error | null;
  resetErrorBoundary?: () => void;
}

export function MainErrorFallback({
  error,
  resetErrorBoundary,
}: MainErrorFallbackProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="flex max-w-md flex-col items-center space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
          <FiAlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#2a4263]">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          {import.meta.env.DEV && error && (
            <div className="mt-4 max-h-32 w-full overflow-auto rounded-lg bg-gray-100 p-3 text-left font-mono text-xs text-red-600">
              {error.message}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (resetErrorBoundary) {
              resetErrorBoundary();
            } else {
              window.location.assign(window.location.origin);
            }
          }}
          className="btn h-12 w-full gap-2 rounded-xl border-none bg-[#2a4263] text-base font-semibold text-white shadow-md transition-all hover:bg-[#1e3a5a] hover:shadow-lg active:scale-95"
        >
          <LuRefreshCw className="h-5 w-5" />
          Refresh Application
        </button>
      </div>

      <div className="mt-8 text-xs text-gray-400">
        <p>If this persists, please contact support.</p>
      </div>
    </div>
  );
}
