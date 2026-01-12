import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import AdminRoot from './routes/admin/root';
import AppRoot from './routes/app/root';
import LandingRoute from './routes/landing';
import LguRoot from './routes/lgu/root';
import NotFoundRoute from './routes/not-found';

import { paths } from '@/config/paths';
import { ProtectedRoute } from '@/lib/auth';
import { AuthorizationGuard } from '@/lib/authorization';
import { ROLES } from '@/lib/authorization';

/**
 * Helper to inject queryClient into lazy-loaded loaders and actions
 */
const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  };
};

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    // --- PUBLIC ROUTES ---
    {
      path: paths.home.path,
      element: <LandingRoute />,
    },
    {
      path: paths.auth.login.path,
      lazy: () => import('./routes/auth/login').then(convert(queryClient)),
    },
    {
      path: paths.auth.register.path,
      lazy: () => import('./routes/auth/register').then(convert(queryClient)),
    },
    {
      path: paths.auth['verify-email'].path,
      lazy: () =>
        import('./routes/auth/verify-email').then(convert(queryClient)),
    },
    {
      path: paths.auth['reset-password'].path,
      lazy: () =>
        import('./routes/auth/reset-password').then(convert(queryClient)),
    },
    {
      path: paths.auth['forget-password'].path,
      lazy: () =>
        import('./routes/auth/forget-password').then(convert(queryClient)),
    },

    // --- PROTECTED APP ROUTES (Citizen) ---
    {
      path: paths.app.root.path,
      element: (
        <ProtectedRoute>
          <AuthorizationGuard allowedRoles={[ROLES.CITIZEN]}>
            <AppRoot />
          </AuthorizationGuard>
        </ProtectedRoute>
      ),
      children: [
        {
          path: paths.app.dashboard.path,
          lazy: () =>
            import('./routes/app/dashboard').then(convert(queryClient)),
        },
        {
          path: paths.app.onboarding.path,
          lazy: () =>
            import('./routes/app/onboarding').then(convert(queryClient)),
        },
        {
          path: paths.app.profile.path,
          lazy: () =>
            import('./routes/app/profile/profile').then(convert(queryClient)),
        },
        {
          path: paths.app.profile.edit.path,
          lazy: () =>
            import('./routes/app/profile/edit-profile').then(
              convert(queryClient),
            ),
        },
        {
          path: paths.app['community-posts'].path,
          lazy: () =>
            import('./routes/app/community-posts').then(convert(queryClient)),
        },
        {
          path: paths.app.leaderboard.path,
          lazy: () =>
            import('./routes/app/leaderboard').then(convert(queryClient)),
        },
        {
          path: paths.app.modules.path,
          lazy: () =>
            import('./routes/app/modules/modules').then(convert(queryClient)),
        },
        {
          path: paths.app.module.path,
          lazy: () =>
            import('./routes/app/modules/module').then(convert(queryClient)),
        },
        {
          path: paths.app.quiz.path,
          lazy: () =>
            import('./routes/app/modules/quiz-runner').then(
              convert(queryClient),
            ),
        },
      ],
    },

    // --- PROTECTED LGU ROUTES ---
    {
      path: paths.lgu.root.path,
      element: (
        <ProtectedRoute>
          {/* 4. ADD GUARD FOR LGU */}
          <AuthorizationGuard allowedRoles={[ROLES.LGU]}>
            <LguRoot />
          </AuthorizationGuard>
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          lazy: () =>
            import('./routes/lgu/dashboard').then(convert(queryClient)),
        },
        {
          path: paths.lgu.leaderboard.path,
          lazy: () =>
            import('./routes/lgu/lgu-leaderboard').then(convert(queryClient)),
        },
        {
          path: paths.lgu.moderation.path,
          lazy: () =>
            import('./routes/lgu/moderation').then(convert(queryClient)),
        },
        {
          path: paths.lgu['go-bags'].path,
          lazy: () =>
            import('./routes/lgu/resident-gobags').then(convert(queryClient)),
        },
      ],
    },

    // --- ADMIN ROUTES ---
    {
      path: paths.admin.root.path,
      element: (
        <ProtectedRoute>
          {/* 5. ADD GUARD FOR SUPER ADMIN */}
          <AuthorizationGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
            <AdminRoot />
          </AuthorizationGuard>
        </ProtectedRoute>
      ),
      children: [
        {
          path: paths.admin['tenant-manager'].path,
          lazy: () =>
            import('./routes/admin/tenant-manager').then(convert(queryClient)),
        },
        {
          path: paths.admin['module-editor'].path,
          lazy: () =>
            import('./routes/admin/module-editor').then(convert(queryClient)),
        },
      ],
    },

    {
      path: '*',
      element: <NotFoundRoute />,
    },
  ]);

export function AppRouter() {
  const queryClient = useQueryClient();
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
}
