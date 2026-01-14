import { zodResolver } from '@hookform/resolvers/zod';
import {
  OnboardingRequestSchema,
  type OnboardingRequest,
} from '@repo/shared/dist/schemas/user.schema';
import { useState, useEffect } from 'react';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router';

import Toast from '@/components/ui/toast/toast';
import { paths } from '@/config/paths';
import { useUpdateOnboarding } from '@/features/onboarding/api/update-onboarding';
import { OnboardingLayout } from '@/features/onboarding/components/onboarding-layout';
import { StepHousehold } from '@/features/onboarding/components/step-household';
import { StepLocation } from '@/features/onboarding/components/step-location';
import { useUser } from '@/lib/auth';

// Define keys for LocalStorage
const STORAGE_KEY = 'onboarding_progress';
const STEP_KEY = 'onboarding_step';

export default function OnboardingRoute() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser();

  // 1. Initialize Step from LocalStorage
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem(STEP_KEY);
      return savedStep ? parseInt(savedStep, 10) : 1;
    }
    return 1;
  });

  const [toastError, setToastError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate(paths.auth.login.getHref());
      return;
    }

    if (user.onboardingCompleted) {
      navigate(paths.app.root.getHref());
    }
  }, [user, isLoading, navigate]);

  const methods = useForm<OnboardingRequest>({
    resolver: zodResolver(
      OnboardingRequestSchema,
    ) as Resolver<OnboardingRequest>,
    defaultValues: {
      emailConsent: true,
      householdInfo: {
        memberCount: 1,
        femaleCount: 0,
        pets: 0,
      },
    },
    mode: 'onChange',
  });

  const { watch, reset, getValues } = methods;

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        reset({ ...getValues(), ...parsed });
      } catch (error) {
        console.error('Failed to parse onboarding progress:', error);
      }
    }
  }, [reset, getValues]);

  // 4. Save Form Data on Change
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // 5. Save Step on Change
  useEffect(() => {
    localStorage.setItem(STEP_KEY, page.toString());
  }, [page]);

  const mutation = useUpdateOnboarding({
    mutationConfig: {
      onSuccess: () => {
        // Clear Storage on Success
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STEP_KEY);
        navigate(paths.app.root.getHref());
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update';
        setToastError(message);
      },
    },
  });

  const onSubmit: SubmitHandler<OnboardingRequest> = (data) => {
    mutation.mutate({ data });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user || user.onboardingCompleted) {
    return null;
  }

  return (
    <OnboardingLayout>
      {toastError && <Toast show={true} message={toastError} type="error" />}
      <FormProvider {...methods}>
        <form className="w-full" onSubmit={methods.handleSubmit(onSubmit)}>
          {page === 1 && <StepLocation onNext={() => setPage(2)} />}

          {page === 2 && (
            <StepHousehold
              onBack={() => setPage(1)}
              isSubmitting={mutation.isPending}
            />
          )}
        </form>
      </FormProvider>
    </OnboardingLayout>
  );
}
