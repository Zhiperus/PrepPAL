import { useState } from 'react';
import { LuSearch, LuBookOpen, LuTrophy, LuBrainCircuit } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { useModules } from '../api/get-modules';
import { ModuleCard } from '../components/module-card';

import { useUser } from '@/lib/auth';

export default function ModuleDiscovery() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: modulesData, isLoading: isModulesLoading } = useModules();
  const modules = modulesData?.data;

  const filteredModules = modules?.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isUserLoading || isModulesLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <span className="loading loading-spinner loading-lg text-[#2a4263]"></span>
      </div>
    );
  }

  const featuredModule = modules && modules.length > 0 ? modules[0] : null;

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-20">
      {/* --- Header Section --- */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="pt-5 lg:pt-0">
              <h1 className="text-center text-3xl font-extrabold text-[#2a4263] md:text-left">
                Learning Center
              </h1>
              <p className="mt-1 text-center text-sm text-gray-500 md:text-left">
                Master disaster preparedness and earn rewards.
              </p>
            </div>

            {/* Points Card (Compact) */}
            <div className="flex items-center gap-3 rounded-xl bg-[#2a4263] px-5 py-3 text-white shadow-md transition-transform hover:scale-105">
              <div className="rounded-full bg-white/20 p-2">
                <LuTrophy className="h-6 w-6 text-yellow-300" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-bold">
                  {user?.points?.modules || 0}
                </span>
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
                placeholder="Search topics (e.g., 'Fire Safety', 'Typhoon')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!searchTerm && featuredModule && (
          <div className="mb-6 overflow-hidden rounded-xl bg-[#2a4263] text-white shadow-lg lg:mb-10 lg:flex lg:rounded-2xl lg:shadow-xl">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:w-1/2 lg:p-12">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-200 uppercase sm:text-sm">
                <LuBookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                Featured Module
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:mt-4 sm:text-3xl lg:text-4xl">
                {featuredModule.title}
              </h2>

              <p className="mt-2 line-clamp-3 text-sm text-gray-300 sm:mt-4 sm:line-clamp-none sm:text-lg">
                {featuredModule.description}
              </p>

              <div className="mt-4 sm:mt-8">
                <button
                  onClick={() => navigate(`/app/modules/${featuredModule._id}`)}
                  className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#2a4263] shadow-sm transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:px-6 sm:py-3 sm:text-base"
                >
                  Start Learning
                </button>
              </div>
            </div>

            {/* --- Decorative Side: HIDDEN on mobile, Flex on Large Screens --- */}
            <div className="hidden bg-[#1e3048] lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:p-8">
              <LuBrainCircuit className="h-40 w-40 text-white/10" />
            </div>
          </div>
        )}
        {/* --- Modules Grid --- */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {searchTerm ? 'Search Results' : 'All Modules'}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredModules?.length || 0} module(s) available
          </span>
        </div>

        {filteredModules?.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-lg">No modules found matching {searchTerm}.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredModules?.map((module) => (
              <ModuleCard key={module._id} module={module} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
