import { useState } from 'react';
import { useForm } from 'react-hook-form';

import AuthBackgroundShape from '@/assets/svg/auth-background-shape';
import { Link } from '@/components/ui/link';
import { forgotPassword } from '@/lib/auth';

// Define form data structure
interface FormData {
  email: string;
}

export default function ForgotPasswordForm() {
  const [isSent, setIsSent] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setApiError('');

    try {
      await forgotPassword({ email: data.email });
      setIsSent(true);
    } catch (err) {
      setApiError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div
      data-theme="light"
      className="bg-base-200 relative flex min-h-screen items-center justify-center overflow-hidden p-4 text-slate-900"
    >
      {/* Background Shape */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <AuthBackgroundShape className="text-slate-500" />
      </div>

      <div className="card z-10 w-full max-w-[420px] border border-slate-100 bg-white shadow-xl">
        <div className="card-body p-8">
          {/* Logo Section */}
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
              {/* PrepPAL Logo Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">PrepPAL</span>
          </div>

          {isSent ? (
            /* Success State */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
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
              <h2 className="text-xl font-bold text-slate-900">
                Check your inbox
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                We have sent a password reset link to your email.
              </p>
              <Link
                to="/auth/login"
                className="btn mt-6 w-full border-none bg-[#2e4463] text-white normal-case hover:bg-[#138fb1]"
              >
                Back to login
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                Forgot Password?
              </h2>
              <p className="mt-2 mb-6 text-sm leading-relaxed text-slate-500">
                Enter your email and we&apos;ll send you instructions to reset
                your password
              </p>

              {apiError && (
                <div className="alert alert-error mb-4 border border-red-100 bg-red-50 py-2 text-sm text-red-600">
                  <span>{apiError}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="form-control w-full">
                  <label className="label justify-start pt-0 pb-1.5">
                    <span className="label-text font-medium text-slate-900">
                      Email address
                    </span>
                    <span className="ml-0.5 text-red-500">*</span>
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className={`input input-bordered w-full bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none ${errors.email ? 'input-error focus:border-red-500' : 'border-slate-200 focus:border-slate-400'}`}
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address',
                      },
                    })}
                  />

                  {errors.email && (
                    <span className="mt-1.5 ml-1 text-xs text-red-500">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn mt-2 w-full border-none bg-[#2e4463] text-white normal-case hover:bg-[#138fb1] disabled:bg-[#9ba2ad] disabled:text-white"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm text-white"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm font-medium text-slate-900 hover:underline"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
