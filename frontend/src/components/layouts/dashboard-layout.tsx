import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/config/paths';
import { useLogout, useUser } from '@/lib/auth';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser();
  const logout = useLogout({
    onSuccess: () => navigate(paths.auth.login.getHref()),
  });

  useEffect(() => {
    if (!isLoading && user && !user.onboardingCompleted) {
      navigate(paths.onboarding.getHref());
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user?.onboardingCompleted) {
    navigate(paths.onboarding.getHref());
  }

  return (
    <h1>
      <button onClick={() => logout.mutate({})}>Log out</button>
      {children}
    </h1>
  );
}
