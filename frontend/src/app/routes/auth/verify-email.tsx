import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/config/paths';
import { useVerifyEmailQuery } from '@/features/auth/api/verify-email';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { isLoading, isSuccess, isError, error } = useVerifyEmailQuery(token);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="alert alert-error max-w-md">
          Invalid Verification Link
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] p-4 text-center">
      <div className="card w-full max-w-md bg-white p-8 shadow-xl">
        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex flex-col items-center">
            <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
            <h2 className="text-xl font-bold text-gray-800">
              Verifying your email...
            </h2>
            <p className="text-gray-500">Please wait a moment.</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {isSuccess && (
          <div className="animate-in fade-in zoom-in flex flex-col items-center duration-300">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Email Verified!
            </h2>
            <p className="mt-2 text-gray-600">
              Thank you for verifying your email.{' '}
            </p>
            <button
              onClick={() => navigate(paths.app.root.getHref())}
              className="btn btn-primary mt-6 w-full"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {isError && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-red-100 p-3">
              <svg
                className="h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Verification Failed
            </h2>
            <p className="mt-2 text-gray-600">
              {(error as any)?.response?.data?.message ||
                'The link may be invalid or expired.'}
            </p>
            <button
              onClick={() => navigate(paths.auth.login.getHref())}
              className="btn btn-outline mt-6 w-full"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
