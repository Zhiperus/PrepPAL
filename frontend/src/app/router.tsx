import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from './routes/app/root';

import { paths } from '@/config/paths';
import { ProtectedRoute } from '@/lib/auth';

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
    {
      path: paths.home.path,
      lazy: () => import('./routes/landing').then(convert(queryClient)),
    },
    {
      path: paths.auth['forget-password'].path,
      lazy: () =>
        import('./routes/auth/forget-password').then(convert(queryClient)),
    },
    {
      path: paths.auth['reset-password'].path,
      lazy: () =>
        import('./routes/auth/reset-password').then(convert(queryClient)),
    },
    {
      path: paths.auth['verify-email'].path,
      lazy: () =>
        import('./routes/auth/verify-email').then(convert(queryClient)),
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
      path: paths.app.root.path,
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      ErrorBoundary: AppRootErrorBoundary,
      children: [
        {
          path: paths.app.onboarding.path,
          lazy: () =>
            import('./routes/app/onboarding').then(convert(queryClient)),
        },
        {
          path: paths.app.profile.path,
          lazy: () => import('./routes/app/profile').then(convert(queryClient)),
        },
        {
          path: paths.app.profile.edit.path,
          lazy: () =>
            import('./routes/app/edit-profile').then(convert(queryClient)),
        },
        {
          path: paths.app['community-posts'].path,
          lazy: () =>
            import('./routes/app/community-posts').then(convert(queryClient)),
        },
        {
          path: paths.app['leaderboard'].path,
          lazy: () =>
            import('./routes/app/leaderboard').then(convert(queryClient)),
        },
      ],
    },
    {
      path: '*',
      lazy: () => import('./routes/not-found').then(convert(queryClient)),
    },
  ]);

export function AppRouter() {
  const queryClient = useQueryClient();

  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  return <RouterProvider router={router} />;
}
