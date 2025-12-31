import { Outlet, useLocation } from 'react-router';

import { DashboardLayout } from '@/components/layouts';
import { paths } from '@/config/paths';

export function ErrorBoundary() {
  return <div>Something went wrong!</div>;
}

export default function AppRoot() {
  const location = useLocation();

  const isOnboarding =
    location.pathname.endsWith(paths.app.onboarding.path) ||
    location.pathname === '/app/onboarding';

  if (isOnboarding) {
    return <Outlet />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
