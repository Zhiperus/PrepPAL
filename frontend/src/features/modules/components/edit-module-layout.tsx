/*
 * Objects in this component:
 * - Header
 *    - title header
 *    - publication status
 * - Module View and Controls
 *   - Card View, display all modules
 *      - Status Light
 *        - Green: Live, Published
 *        - Yellow: Live, with unpublished changes
 *        - Red: Unpublished (?)
 *      - Title
 *      - Module Description
 *      - Last Updated time
 *      - View, Edit, Delete Buttons
 *   - Control Buttons
 *      - Add: Create new modules, not published immediately
 *      - Publish: Upload changes
 *      - View: Read-only view
 *      - Edit: Modify exisiting modules
 *      - Delete: Remove module from database
 * */

import { useRef, useState, useEffect } from 'react';
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
import { EditModuleCard } from '../components/edit-module-card.tsx';
import { EditModuleModal } from '../components/edit-module-form.tsx';

import { ModuleCardSkeleton } from '@/components/ui/skeletons/module-card-skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { useUser } from '@/lib/auth';

export default function ModuleDiscovery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // Open Modal
  const handleEditClick = (module) => {
    setSelectedModule(module);
    modalRef.current?.showModal();
  };

  // URL State
  const queryParam = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1');

  // Input State
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync Search to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
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
      search: queryParam,
    },
  });

  const modules = modulesData?.data || [];
  const meta = modulesData?.meta;

  const showSkeletons = isModulesLoading && !isPlaceholderData;

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-20">
      {/* Header & Search Bar Section */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl px-4 py-6 sm:px-6 md:justify-between lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-[#2a4263]">
                Administrator: Module Editor
              </h1>
              <div className="badge badge-outline badge-success mt-2 gap-4 p-3">
                <div
                  aria-label="success"
                  className="status status-success"
                ></div>
                <span>No unpublished changes.</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-6 max-w-md">
            <LuSearch className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="block w-full rounded-lg border-gray-300 bg-gray-100 py-3 pl-10 text-sm focus:border-[#2a4263] focus:bg-white"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {queryParam ? `Results for "${queryParam}"` : 'All Modules'}
          </h3>
          <span className="text-sm text-gray-500">
            {meta?.total || 0} modules
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {showSkeletons ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ModuleCardSkeleton key={i} />
            ))
          ) : modules.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500">
              <LuSearch className="mx-auto h-12 w-12 opacity-20" />
              <p>No modules found.</p>
            </div>
          ) : (
            modules.map((module) => (
              <EditModuleCard
                key={module._id}
                module={module}
                onEdit={() => handleEditClick(module)}
              />
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
      <EditModuleModal ref={modalRef} module={selectedModule} />
    </div>
  );
}
