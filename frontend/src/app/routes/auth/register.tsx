import { useNavigate, useSearchParams } from 'react-router';

import AuthLayout from '@/components/layouts/auth-layout';
import { paths } from '@/config/paths';
import RegisterForm from '@/features/auth/components/register-form';

export default function RegisterRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <AuthLayout>
      <RegisterForm
        onSuccess={() => {
          navigate(
            `${redirectTo ? `${redirectTo}` : paths.onboarding.getHref()}`,
            {
              replace: true,
            },
          );
        }}
      />
    </AuthLayout>
  );
}
