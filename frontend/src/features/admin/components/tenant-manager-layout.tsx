import { useState, useEffect } from 'react';
import { IoMdMore } from 'react-icons/io';
import {
  LuSearch,
  LuPlus,
  LuMapPin,
  LuMail,
  LuLoader,
  LuTrash2,
  LuChevronLeft,
  LuChevronRight,
} from 'react-icons/lu';

import { useDeleteLgu } from '../api/delete-lgu';
import { useLgus, type LguTenant } from '../api/get-lgus';

import { AddLGUModal } from './add-lgu';
import { ViewLGUModal } from './edit-lgu';

import { useDebounce } from '@/hooks/use-debounce'; // Assuming you have a debounce hook

export function TenantManagerLayout() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1); // Current Page
  const [selectedBarangayCode, setSelectedBarangayCode] = useState<
    string | null
  >(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Debounce search to prevent API spam while typing
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Fetch Data
  const {
    data: response,
    isLoading,
    isError,
    isPlaceholderData,
  } = useLgus({
    params: {
      search: debouncedSearch,
      page: page,
      limit: 10,
    },
  });

  const { mutate: deleteLguMutation, isPending: isDeleting } = useDeleteLgu();

  const lgus = response?.data || [];
  const meta = response?.meta;

  const selectedTenant = lgus.find((t) => t.id === selectedBarangayCode);

  const handleDelete = (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to PERMANENTLY DELETE ${name}? This cannot be undone.`,
      )
    ) {
      deleteLguMutation({ id });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="pt-10 text-3xl font-extrabold tracking-tight text-[#2a4263] lg:pt-0">
                Tenant Manager
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage Local Government Unit (LGU) accounts.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn gap-2 rounded-xl border-none bg-[#2a4263] text-white shadow-sm hover:bg-[#1e3a5a]"
            >
              <LuPlus size={18} />
              Add LGU Account
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-96">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LuSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by barangay or city..."
              className="input input-bordered w-full rounded-xl bg-white pl-10 shadow-sm focus:border-[#2a4263] focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="min-h-[400px] overflow-auto rounded-t-2xl">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="sticky top-0 z-20 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 uppercase shadow-sm">
                <tr>
                  <th className="bg-gray-50 px-6 py-4">LGU Name / Location</th>
                  <th className="bg-gray-50 px-6 py-4">Admin Email</th>
                  <th className="bg-gray-50 px-6 py-4 text-center">Users</th>
                  <th className="bg-gray-50 px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <LuLoader className="h-8 w-8 animate-spin text-[#2a4263]" />
                        <span className="text-gray-500">Loading LGUs...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-red-500"
                    >
                      Failed to load LGU data.
                    </td>
                  </tr>
                ) : lgus.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      No tenants found matching {searchTerm}
                    </td>
                  </tr>
                ) : (
                  lgus.map((tenant: LguTenant, index: number) => {
                    const isLastRows = index >= lgus.length - 2;
                    return (
                      <tr
                        key={tenant.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-[#2a4263]">
                              {tenant.name}
                            </span>
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                              <LuMapPin size={12} />
                              {tenant.city}, {tenant.province}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <LuMail size={14} className="text-gray-400" />
                            {tenant.adminEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10">
                            {tenant.registeredUsers ?? 0} citizens
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className={`dropdown dropdown-end dropdown-left ${isLastRows ? 'dropdown-top' : 'dropdown-bottom'}`}
                          >
                            <div
                              tabIndex={0}
                              role="button"
                              className="btn btn-ghost btn-sm btn-square text-gray-400 hover:text-[#2a4263]"
                            >
                              <IoMdMore size={18} />
                            </div>
                            <ul
                              tabIndex={0}
                              className="dropdown-content menu rounded-box z-50 my-1 w-52 border border-gray-100 bg-white p-2 shadow-lg"
                            >
                              <li>
                                <button
                                  onClick={() =>
                                    setSelectedBarangayCode(tenant.id)
                                  }
                                >
                                  View Account
                                </button>
                              </li>
                              <li>
                                <button
                                  className="text-red-500 hover:bg-red-50"
                                  onClick={() =>
                                    handleDelete(tenant.id, tenant.name)
                                  }
                                  disabled={isDeleting}
                                >
                                  <LuTrash2 size={16} />
                                  Delete Account
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between rounded-b-2xl border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{meta?.page}</span>{' '}
                  of <span className="font-medium">{meta?.totalPages}</span> (
                  {meta?.total} total results)
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPage((old) => Math.max(old - 1, 1))}
                    disabled={page === 1 || isLoading}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <LuChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        !isPlaceholderData &&
                        meta?.page !== meta?.totalPages
                      ) {
                        setPage((old) => old + 1);
                      }
                    }}
                    disabled={meta?.page === meta?.totalPages || isLoading}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <LuChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ViewLGUModal
        isOpen={!!selectedBarangayCode}
        tenant={selectedTenant}
        onClose={() => setSelectedBarangayCode(null)}
      />
      <AddLGUModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
