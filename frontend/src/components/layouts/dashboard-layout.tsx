import { useEffect } from 'react';
import {
  GoHome,
  GoBook,
  GoPencil,
  GoGraph,
  GoInfo,
  GoSignOut,
} from 'react-icons/go';
import { RxHamburgerMenu } from 'react-icons/rx';
import { useNavigate } from 'react-router';

import { Link } from '@/components/ui/link';
import { paths } from '@/config/paths';
import { useLogout, useUser } from '@/lib/auth';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useUser();

  const logout = useLogout();

  useEffect(() => {
    if (isLoading) return;

    if (isError || !user) {
      navigate(paths.auth.login.getHref());
      return;
    }

    if (!user.onboardingCompleted) {
      navigate(paths.app.onboarding.getHref());
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
    <div className="relative min-h-screen bg-gray-50">
      <div className="drawer">
        <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />

        {/* --- MAIN CONTENT --- */}
        <div className="drawer-content">
          <label
            htmlFor="my-drawer-1"
            className="btn btn-ghost btn-circle drawer-button absolute top-4 left-4 z-50"
          >
            <RxHamburgerMenu className="h-6 w-6 text-black" />
          </label>

          {children}
        </div>

        {/* --- SIDEBAR OVERLAY --- */}
        <div className="drawer-side z-50">
          <label
            htmlFor="my-drawer-1"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>

          {/* Sidebar Container - Matches image shape */}
          <div className="flex min-h-full w-72 flex-col rounded-tr-[50px] rounded-br-[50px] bg-white p-6 shadow-lg">
            {/* 1. Header: Profile */}
            <div
              className="mt-4 mb-6 flex items-center gap-4 pl-2 hover:cursor-pointer hover:bg-gray-100"
              onClick={() => navigate(paths.app.profile.getHref())}
            >
              <div className="avatar placeholder">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-black">
                  <span className="text-xl font-bold">
                    {user.householdName?.charAt(0).toUpperCase() || 'J'}
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold text-black">
                {user.householdName || 'Juan'}
              </span>
            </div>

            <div className="mb-8 h-px w-full bg-gray-200"></div>

            <ul className="flex flex-col gap-8 font-medium text-gray-700">
              <li>
                <Link
                  to={paths.app.dashboard.getHref()}
                  className="flex cursor-pointer items-center gap-4 rounded-lg p-2 hover:bg-gray-100"
                >
                  <GoHome className="h-6 w-6" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to={paths.app.modules.getHref()}
                  className="flex cursor-pointer items-center gap-4 rounded-lg p-2 hover:bg-gray-100"
                >
                  <GoBook className="h-6 w-6" />
                  <span>Modules</span>
                </Link>
              </li>
              <li>
                <Link
                  to={paths.app['community-posts'].getHref()}
                  className="flex cursor-pointer items-center gap-4 rounded-lg p-2 hover:bg-gray-100"
                >
                  <GoPencil className="h-6 w-6" />
                  <span>Community Posts</span>
                </Link>
              </li>
              <li>
                <Link
                  to={paths.app.leaderboard.getHref()}
                  className="flex cursor-pointer items-center gap-4 rounded-lg p-2 hover:bg-gray-100"
                >
                  <GoGraph className="h-6 w-6" />
                  <span>Leaderboard</span>
                </Link>
              </li>
            </ul>

            <div className="mt-auto mb-4 flex flex-col gap-4 font-medium text-gray-700">
              <button className="flex cursor-pointer items-center gap-4 rounded-lg p-2 hover:bg-gray-100">
                <GoInfo className="h-6 w-6" />
                <span>About</span>
              </button>

              <button
                className="flex cursor-pointer items-center gap-4 rounded-lg p-2 text-red-500 hover:bg-red-50"
                onClick={() => logout.mutate({})}
              >
                <GoSignOut className="h-6 w-6 rotate-180 transform" />{' '}
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
