import { zodResolver } from '@hookform/resolvers/zod';
import {
  OnboardingRequestSchema,
  type OnboardingRequest,
} from '@shared/schemas/user.schema';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router';

import Toast from '@/components/ui/toast/toast';
import { paths } from '@/config/paths';
import { useUpdateOnboarding } from '@/features/onboarding/api/update-onboarding';
import { OnboardingLayout } from '@/features/onboarding/components/onboarding-layout';
import { StepHousehold } from '@/features/onboarding/components/step-household';
import { StepLocation } from '@/features/onboarding/components/step-location';
import { useUser } from '@/lib/auth';

export default function Onboarding() {
  const navigate = useNavigate();
  const user = useUser();
  const [page, setPage] = useState(1);
  const [toastError, setToastError] = useState<string | null>(null);

  if (user.data?.onboardingCompleted) {
    navigate(paths.app.root.getHref());
  }

  const methods = useForm<OnboardingRequest>({
    resolver: zodResolver(OnboardingRequestSchema),
    defaultValues: {
      emailConsent: true,
      householdInfo: {
        memberCount: 1,
        femaleCount: 0,
        dogCount: 0,
        catCount: 0,
      },
    },
    mode: 'onChange',
  });

  const mutation = useUpdateOnboarding({
    mutationConfig: {
      onSuccess: () => navigate(paths.app.root.getHref()),
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
