import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/config/paths';
import { useLogout, useUser } from '@/lib/auth';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useUser();

  const logout = useLogout({
    onSuccess: () => navigate(paths.auth.login.getHref()),
  });

  useEffect(() => {
    if (isLoading) return;

    if (isError || !user) {
      navigate(paths.auth.login.getHref());
      return;
    }

    if (!user.onboardingCompleted) {
      navigate(paths.onboarding.getHref());
    }
  }, [user, isLoading, isError, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError || !user || !user.onboardingCompleted) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between bg-gray-100 p-4">
        <span>Dashboard</span>
        <button onClick={() => logout.mutate({})}>Log out</button>
      </div>
      {children}
    </div>
  );
}
