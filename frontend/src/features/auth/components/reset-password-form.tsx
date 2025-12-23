import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { LuCircleAlert, LuEye, LuEyeClosed } from 'react-icons/lu';
import { useNavigate, useSearchParams } from 'react-router';

import logo from '@/assets/logo.png';
import AuthBackgroundShape from '@/assets/svg/auth-background-shape';
import { resetPassword } from '@/lib/auth';

interface FormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!token) {
      setApiError('Invalid or missing token.');
      return;
    }

    setApiError(null);
    try {
      await resetPassword({ password: data.password, token });
      navigate('/auth/login');
    } catch (err: any) {
      console.error(err);
      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to reset password. The link may have expired.',
      );
    }
  };

  // Immediate check for token presence
  if (!token) {
    return (
      <div className="bg-bg-page flex h-screen items-center justify-center p-4 text-center">
        <div className="bg-bg-error-container/50 border-text-error/20 text-text-error flex max-w-md items-center gap-3 rounded-lg border p-4 font-medium shadow-lg">
          <LuCircleAlert className="h-6 w-6 shrink-0" />
          <span>
            Invalid or missing reset token. Please request a new link.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme="light"
      className="bg-bg-page relative flex min-h-screen items-center justify-center overflow-hidden p-4"
    >
      {/* Background Shape */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <AuthBackgroundShape className="text-text-secondary/10" />
      </div>

      <div className="border-border-container bg-bg-primary card z-10 w-full max-w-[420px] border shadow-xl">
        <div className="card-body p-8">
          {/* Logo Section */}
          <div className="mb-6 flex items-center justify-center gap-2.5">
            <img src={logo} alt="PrepPAL Logo" className="h-8 w-8" />
            <span className="text-text-primary text-xl font-bold">PrepPAL</span>
          </div>

          <h2 className="text-text-primary text-2xl font-bold">
            Reset Password
          </h2>
          <p className="text-text-secondary mt-2 mb-6 text-sm leading-relaxed">
            Please enter your new password below.
          </p>

          {/* API Error Alert */}
          {apiError && (
            <div className="border-text-error/20 bg-bg-error-container/50 text-text-error animate-in fade-in slide-in-from-top-1 mb-4 flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
              <LuCircleAlert className="h-5 w-5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* New Password Field */}
            <div className="form-control w-full">
              <label className="text-text-primary mb-1.5 block text-sm font-bold">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className={`input block w-full rounded-md border py-2 pr-10 transition-all outline-none sm:text-sm ${
                    errors.password
                      ? 'input-error bg-bg-error-container/10'
                      : 'border-text-primary focus:border-text-link-hover'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />

                {/* Toggle Visibility */}
                <div
                  className="text-text-secondary hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <LuEyeClosed size={20} />
                  ) : (
                    <LuEye size={20} />
                  )}
                </div>
              </div>

              {errors.password && (
                <div className="text-text-error animate-in fade-in slide-in-from-top-1 mt-1.5 flex items-center gap-2 transition-all">
                  <p className="text-xs font-medium">
                    {errors.password.message}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-control w-full">
              <label className="text-text-primary mb-1.5 block text-sm font-bold">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className={`input block w-full rounded-md border py-2 pr-10 transition-all outline-none sm:text-sm ${
                    errors.confirmPassword
                      ? 'input-error bg-bg-error-container/10'
                      : 'border-text-primary focus:border-text-link-hover'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => {
                      if (watch('password') !== val) {
                        return 'Your passwords do not match';
                      }
                    },
                  })}
                />

                {/* Toggle Visibility */}
                <div
                  className="text-text-secondary hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <LuEyeClosed size={20} />
                  ) : (
                    <LuEye size={20} />
                  )}
                </div>
              </div>

              {errors.confirmPassword && (
                <div className="text-text-error animate-in fade-in slide-in-from-top-1 mt-1.5 flex items-center gap-2 transition-all">
                  <p className="text-xs font-medium">
                    {errors.confirmPassword.message}
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
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
