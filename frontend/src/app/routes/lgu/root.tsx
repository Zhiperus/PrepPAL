import { Outlet, useLocation } from 'react-router';

import { LguDashboardLayout } from '@/components/layouts/lgu/dashboard-layout';

export function ErrorBoundary() {
  return <div>Something went wrong!</div>;
}

export default function LguRoot() {
  const location = useLocation();

  return (
    <LguDashboardLayout>
      <Outlet />
    </LguDashboardLayout>
  );
}
