import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { FiAlertCircle, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

import logo from '@/assets/logo.png';
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

  const onSubmit: SubmitHandler<FormData> = async (data) => {
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
      className="bg-bg-page relative flex min-h-screen items-center justify-center overflow-hidden p-4"
    >
      {/* Background Shape */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <AuthBackgroundShape className="text-text-secondary/70" />
      </div>

      <div className="border-border-container bg-bg-primary card z-10 w-full max-w-[420px] border shadow-xl">
        <div className="card-body p-8">
          {/* Logo Section */}
          <div className="mb-6 flex items-center justify-center gap-2.5">
            <img src={logo} alt="PrepPAL Logo" className="h-8 w-8" />
            <span className="text-text-primary text-xl font-bold">PrepPAL</span>
          </div>

          {isSent ? (
            /* --- Success State --- */
            <div className="animate-in fade-in zoom-in text-center duration-300">
              <div className="bg-bg-success-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <FiCheckCircle className="text-text-success h-8 w-8" />
              </div>
              <h2 className="text-text-primary text-2xl font-bold">
                Check your inbox
              </h2>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                We have sent a password reset link to <br />
                <span className="text-text-primary font-medium">
                  {/* You could display the email here if you stored it */}
                  your email address
                </span>
                .
              </p>

              <Link
                to="/auth/login"
                className="btn-primary-custom mt-8 flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-bold shadow-sm transition-colors"
              >
                Back to login
              </Link>
            </div>
          ) : (
            /* --- Form State --- */
            <>
              <div className="text-center">
                <h2 className="text-text-primary text-2xl font-bold">
                  Forgot Password?
                </h2>
                <p className="text-text-secondary mt-2 mb-6 text-sm leading-relaxed">
                  Enter your email address and we&apos;ll send you a link to
                  reset your password.
                </p>
              </div>

              {/* API Error Alert */}
              {apiError && (
                <div className="bg-bg-error-container/50 border-text-error/20 text-text-error mb-4 flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
                  <FiAlertCircle className="h-5 w-5 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="form-control w-full">
                  <label className="text-text-primary mb-1.5 block text-sm font-bold">
                    Email address
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      placeholder="name@example.com"
                      {...register('email', {
                        required: 'Email address is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address',
                        },
                      })}
                      className={`input block w-full rounded-md border py-2 pr-3 transition-all outline-none sm:text-sm ${
                        errors.email
                          ? 'input-error bg-bg-error-container/10'
                          : 'border-text-primary focus:border-text-link-hover'
                      }`}
                    />
                  </div>

                  {/* Field Error */}
                  {errors.email && (
                    <div className="text-text-error animate-in fade-in slide-in-from-top-1 mt-1.5 flex items-center gap-2 transition-all">
                      <p className="text-xs font-medium">
                        {errors.email.message}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disabled disabled:text-text-secondary/50 mt-2 flex w-full cursor-pointer items-center justify-center rounded-md px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  to="/auth/login"
                  className="text-text-primary hover:text-text-link-hover inline-flex items-center text-sm font-bold transition-colors hover:underline"
                >
                  <FiArrowLeft className="mr-2 h-4 w-4" />
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
