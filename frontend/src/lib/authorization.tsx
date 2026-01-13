import * as React from 'react';
import { Navigate, Outlet } from 'react-router';

import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';

// 1. ROLES & TYPES
export const ROLES = {
  CITIZEN: 'citizen',
  LGU: 'lgu',
  SUPER_ADMIN: 'super_admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// 2. POLICIES
export interface BaseEntity {
  id: string;
  [key: string]: any;
}

export type Policy = 'comment:delete';

export const POLICIES = {};

// 3. HOOKS
export const useAuthorization = () => {
  const { data: user } = useUser();

  if (!user) {
    return {
      checkAccess: () => false,
      role: null,
    };
  }

  const checkAccess = ({ allowedRoles }: { allowedRoles: Role[] }) => {
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.role as Role);
    }
    return true;
  };

  return { checkAccess, role: user.role };
};

// 4. COMPONENT: Authorization (For UI Elements)
type AuthorizationProps = {
  allowedRoles: Role[];
  forbiddenFallback?: React.ReactNode;
  children: React.ReactNode;
};

export function Authorization({
  allowedRoles,
  forbiddenFallback = null,
  children,
}: AuthorizationProps) {
  const { checkAccess } = useAuthorization();
  const canAccess = checkAccess({ allowedRoles });

  return <>{canAccess ? children : forbiddenFallback}</>;
}

// 5. COMPONENT: AuthorizationGuard (For Routes)
type AuthorizationGuardProps = {
  allowedRoles: Role[];
  children?: React.ReactNode; // 1. Added children prop
};

export function AuthorizationGuard({
  allowedRoles,
  children,
}: AuthorizationGuardProps) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // A. Not Logged In -> Redirect to Login
  if (!user) {
    return <Navigate to={paths.auth.login.getHref()} replace />;
  }

  // B. Logged In but Wrong Role -> Redirect to Correct Dashboard
  if (!allowedRoles.includes(user.role as Role)) {
    const role = user.role as Role;

    switch (role) {
      case ROLES.LGU:
        return <Navigate to={paths.lgu.root.getHref()} replace />;
      case ROLES.SUPER_ADMIN:
        return (
          <Navigate to={paths.admin['tenant-manager'].getHref()} replace />
        );
      case ROLES.CITIZEN:
      default:
        return <Navigate to={paths.app.dashboard.getHref()} replace />;
    }
  }

  // C. Authorized -> Render Children (or Outlet if used as a layout)
  // This supports both <Guard><AppRoot /></Guard> AND <Route element={<Guard />} />
  return <>{children ? children : <Outlet />}</>;
}
