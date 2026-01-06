import { useState, useEffect } from 'react';
import {
  LuSearch,
  LuBookOpen,
  LuTrophy,
  LuBrainCircuit,
  LuChevronLeft,
  LuChevronRight,
} from 'react-icons/lu';
import { useNavigate, useSearchParams } from 'react-router';

import { useModules } from '../api/get-modules';
import { ModuleCard } from '../components/module-card';

import { ModuleCardSkeleton } from '@/components/ui/skeletons/module-card-skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { useUser } from '@/lib/auth';

export default function ModuleDiscovery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State
  const queryParam = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1');

  // Input State (Local only to prevent lag)
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync Debounced Search to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    // Reset to page 1 if search changes, else keep current page
    if (debouncedSearch !== queryParam) {
      params.page = '1';
    } else if (pageParam > 1) {
      params.page = pageParam.toString();
    }

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, pageParam, setSearchParams, queryParam]);

  const { data: user, isLoading: isUserLoading } = useUser();

  const {
    data: modulesData,
    isLoading: isModulesLoading,
    isPlaceholderData,
  } = useModules({
    params: {
      page: pageParam,
      limit: 9,
      search: queryParam, // API only cares about the validated URL param
    },
  });

  const modules = modulesData?.data || [];
  const meta = modulesData?.meta;

  // Header and User Points always visible unless it's the very first load
  const showSkeletons = isModulesLoading && !isPlaceholderData;

  const featuredModule = modules.length > 0 ? modules[0] : null;

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="pt-5 lg:pt-0">
              <h1 className="text-3xl font-extrabold text-[#2a4263]">
                Learning Center
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Master disaster preparedness and earn rewards.
              </p>
            </div>

            {/* Points Card */}
            <div className="flex items-center gap-3 rounded-xl bg-[#2a4263] px-5 py-3 text-white shadow-md">
              <div className="rounded-full bg-white/20 p-2">
                <LuTrophy className="h-6 w-6 text-yellow-300" />
              </div>
              <div className="flex flex-col leading-none">
                {isUserLoading ? (
                  <div className="h-6 w-12 animate-pulse rounded bg-white/20" />
                ) : (
                  <span className="text-2xl font-bold">
                    {user?.points?.modules.toFixed(2) || 0}
                  </span>
                )}
                <span className="text-[10px] font-medium tracking-wider uppercase opacity-80">
                  Total Points
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LuSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-gray-300 bg-gray-100 py-3 pr-3 pl-10 text-sm focus:border-[#2a4263] focus:bg-white focus:ring-[#2a4263]"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Module Logic */}
        {!queryParam && featuredModule && pageParam === 1 && !showSkeletons && (
          <div className="mb-6 overflow-hidden rounded-xl bg-[#2a4263] text-white shadow-lg lg:mb-10 lg:flex lg:rounded-2xl">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:w-1/2 lg:p-12">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-200 uppercase">
                <LuBookOpen className="h-4 w-4" />
                Featured Module
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
                {featuredModule.title}
              </h2>
              <p className="mt-4 line-clamp-3 text-gray-300">
                {featuredModule.description}
              </p>
              <div className="mt-8">
                <button
                  onClick={() => navigate(`/app/modules/${featuredModule._id}`)}
                  className="inline-flex items-center rounded-lg bg-white px-6 py-3 font-semibold text-[#2a4263] transition-colors hover:bg-gray-100"
                >
                  Start Learning
                </button>
              </div>
            </div>
            <div className="hidden bg-[#1e3048] lg:flex lg:w-1/2 lg:items-center lg:justify-center">
              <LuBrainCircuit className="h-40 w-40 text-white/10" />
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {queryParam ? `Search Results for "${queryParam}"` : 'All Modules'}
          </h3>
          {!showSkeletons && (
            <span className="text-sm text-gray-500">
              {meta?.total || 0} module(s) found
            </span>
          )}
        </div>

        {/* Grid: Show Skeletons or Content */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {showSkeletons ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ModuleCardSkeleton key={i} />
            ))
          ) : modules.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500">
              <LuSearch className="mx-auto h-12 w-12 opacity-20" />
              <p className="mt-4 text-lg">
                No modules found matching {queryParam}
              </p>
            </div>
          ) : (
            modules.map((module) => (
              <ModuleCard key={module._id} module={module} />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!showSkeletons && meta && meta.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              className="btn btn-outline btn-sm"
              disabled={pageParam === 1}
              onClick={() => {
                setSearchParams((prev) => {
                  prev.set('page', (pageParam - 1).toString());
                  return prev;
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <LuChevronLeft className="h-5 w-5" />
              Previous
            </button>

            <span className="text-sm font-bold text-gray-600">
              Page {meta.page} of {meta.totalPages}
            </span>

            <button
              className="btn btn-outline btn-sm"
              disabled={pageParam >= meta.totalPages}
              onClick={() => {
                setSearchParams((prev) => {
                  prev.set('page', (pageParam + 1).toString());
                  return prev;
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Next
              <LuChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
