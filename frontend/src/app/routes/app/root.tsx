import { Outlet } from 'react-router';

import { DashboardLayout } from '@/components/layouts';

export function ErrorBoundary() {
  return <div>Something went wrong!</div>;
}

export default function AppRoot() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
