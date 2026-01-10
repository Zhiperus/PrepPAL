import { Outlet } from 'react-router';

import { AdminDashboardLayout } from '@/components/layouts/admin-layout';

export function ErrorBoundary() {
  return <div>Something went wrong!</div>;
}

export default function AdminRoot() {
  return (
    <AdminDashboardLayout>
      <Outlet />
    </AdminDashboardLayout>
  );
}
