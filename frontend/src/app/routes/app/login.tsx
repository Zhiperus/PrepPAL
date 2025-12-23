import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/config/paths';
import { LoginForm } from '@/components/login-form';

const LoginRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div > 
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
      </div>
    </div>
  );
};

export default LoginRoute;
