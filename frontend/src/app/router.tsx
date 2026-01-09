import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from './routes/app/root';
import {
  default as LguRoot,
  ErrorBoundary as LguRootErrorBoundary,
} from './routes/lgu/root'
import { CommunityPostsRoute } from './routes/app/community-posts';
import { DashboardRoute } from './routes/app/dashboard';
import { LeaderboardRoute } from './routes/app/leaderboard';
import { LguLeaderboardRoute } from './routes/app/lgu-leaderboard'; // New Import
import { ModuleRoute } from './routes/app/modules/module';
import { ModulesRoute } from './routes/app/modules/modules';
import { QuizRunnerRoute } from './routes/app/modules/quiz-runner';
import { OnboardingRoute } from './routes/app/onboarding';
import { EditProfileRoute } from './routes/app/profile/edit-profile';
import { ProfileRoute } from './routes/app/profile/profile';
import { AppRoot } from './routes/app/root';
import { ForgotPasswordRoute } from './routes/auth/forget-password';
import { LoginRoute } from './routes/auth/login';
import { RegisterRoute } from './routes/auth/register';
import { ResetPasswordRoute } from './routes/auth/reset-password';
import { VerifyEmailRoute } from './routes/auth/verify-email';
import { LandingRoute } from './routes/landing';
import { NotFoundRoute } from './routes/not-found';

import { paths } from '@/config/paths';
import { ProtectedRoute } from '@/lib/auth';

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    // --- PUBLIC ROUTES ---
    {
      path: paths.home.path,
      element: <LandingRoute />,
    },
    {
      path: paths.auth.login.path,
      element: <LoginRoute />,
    },
    {
      path: paths.auth.register.path,
      element: <RegisterRoute />,
    },
    {
      path: paths.auth.verifyEmail.path,
      element: <VerifyEmailRoute />,
    },
    {
      path: paths.auth.resetPassword.path,
      element: <ResetPasswordRoute />,
    },
    {
      path: paths.auth.forgotPassword.path,
      element: <ForgotPasswordRoute />,
    },

    // --- PROTECTED APP ROUTES ---
    {
      path: paths.app.root.path,
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      children: [
        {
          path: paths.app.dashboard.path,
          element: <DashboardRoute />,
        },
        {
          path: paths.app.onboarding.path,
          element: <OnboardingRoute />,
        },
        {
          path: paths.app.profile.path,
          element: <ProfileRoute />,
        },
        {
          path: paths.app.editProfile.path,
          element: <EditProfileRoute />,
        },
        {
          path: paths.app.community.path,
          element: <CommunityPostsRoute />,
        },
        {
          path: paths.app.modules.path,
          element: <ModulesRoute />,
        },
        {
          path: paths.app.module.path,
          element: <ModuleRoute />,
        },
        {
          path: paths.app.quiz.path,
          element: <QuizRunnerRoute />,
        },
        // Citizen Leaderboard
        {
          path: paths.app.leaderboard.path,
          element: <LeaderboardRoute />,
        },
        // LGU Leaderboard (New Route)
        {
          path: paths.app.lguLeaderboard.path,
          element: <LguLeaderboardRoute />,
        },
      ],
    },

    // --- CATCH ALL ---
    {
      path: paths.lgu.root.path,
      element:(
        <ProtectedRoute>
          <LguRoot />
        </ProtectedRoute>
        
      ),
      ErrorBoundary: AppRootErrorBoundary, 
      children:[
        {
          index: true, 
          lazy: () => import('./routes/lgu/dashboard').then(convert(queryClient)),
        }
      ]
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