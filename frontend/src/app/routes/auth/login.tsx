import { useNavigate, useSearchParams } from 'react-router';

import AuthLayout from '@/components/layouts/auth-layout';
import { paths } from '@/config/paths';
import LoginForm from '@/features/auth/components/login-form';

export default function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <AuthLayout>
      <LoginForm
        onSuccess={() => {
          navigate(
            `${redirectTo ? `${redirectTo}` : paths.app.root.getHref()}`,
            {
              replace: true,
            },
          );
        }}
      />
    </AuthLayout>
  );
}
