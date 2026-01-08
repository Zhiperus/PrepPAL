import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router';

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

export const createAppRouter = (queryClient: QueryClient) => {
  return createBrowserRouter([
    {
      path: paths.home.path,
      lazy: () => import('./routes/landing').then(convert(queryClient)),
    },
    {
      path: paths.auth['forget-password'].path,
      lazy: () => import('./routes/auth/forget-password').then(convert(queryClient)),
    },
    {
      path: paths.auth['reset-password'].path,
      lazy: () => import('./routes/auth/reset-password').then(convert(queryClient)),
    },
    {
      path: paths.auth['verify-email'].path,
      lazy: () => import('./routes/auth/verify-email').then(convert(queryClient)),
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
          path: paths.app['dashboard'].path,
          lazy: () => import('./routes/app/dashboard').then(convert(queryClient)),
        },
        {
          path: paths.app.onboarding.path,
          lazy: () => import('./routes/app/onboarding').then(convert(queryClient)),
        },
        {
          path: paths.app.profile.path,
          lazy: () => import('./routes/app/profile/profile').then(convert(queryClient)),
        },
        {
          path: paths.app.profile.edit.path,
          lazy: () => import('./routes/app/profile/edit-profile').then(
            convert(queryClient)
          ),
        },
        {
          path: paths.app['community-posts'].path,
          lazy: () => import('./routes/app/community-posts').then(convert(queryClient)),
        },
        {
          path: paths.app['leaderboard'].path,
          lazy: () => import('./routes/app/leaderboard').then(convert(queryClient)),
        },
        {
          path: paths.app.modules.path,
          lazy: () => import('./routes/app/modules/modules').then(convert(queryClient)),
        },
        {
          path: paths.app.module.path,
          lazy: () => import('./routes/app/modules/module').then(convert(queryClient)),
        },
        {
          path: paths.app.quiz.path,
          lazy: () => import('./routes/app/modules/quiz-runner').then(
            convert(queryClient)
          ),
        },
      ],
    },

    {
      path: '/admin', 
      children: [
        {
          path: paths.admin['tenant-manager'].path, 
          lazy: () => import('./routes/admin/tenant-manager').then(convert(queryClient))
        }
      ]
    },

    {
      path: '*',
      lazy: () => import('./routes/not-found').then(convert(queryClient)),
    },
  ]);
};

export function AppRouter() {
  const queryClient = useQueryClient();

  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  return <RouterProvider router={router} />;
}
