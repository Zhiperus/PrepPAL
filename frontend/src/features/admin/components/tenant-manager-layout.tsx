import { useState } from 'react';
import { IoMdMore } from 'react-icons/io';
import { LuSearch, LuPlus, LuMapPin, LuMail, LuLoader } from 'react-icons/lu';

import { useUpdateLgu } from '../api/edit-lgu';
import { useLgus } from '../api/get-lgus';

import { AddLGUModal } from './add-lgu';
import { EditLGUModal } from './edit-lgu';

interface LguTenant {
  id: string; // Note: This ID corresponds to the barangayCode from the backend
  name: string;
  region: string;
  province: string;
  city: string;
  adminEmail: string;
  status: 'active' | 'inactive';
  registeredUsers?: number;
}

export function TenantManagerLayout() {
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedBarangayCode, setSelectedBarangayCode] = useState<
    string | null
  >(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isLoading, isError } = useLgus();
  const { mutate: updateLgu } = useUpdateLgu();

  const lgus = Array.isArray(data) ? data : data?.data || [];

  const filteredTenants = lgus.filter(
    (tenant: LguTenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.city.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // [Fixed] Find tenant by checking if tenant.id matches the selected code
  const selectedTenant = lgus.find(
    (t: LguTenant) => t.id === selectedBarangayCode,
  );

  const handleDeactivate = (barangayCode: string) => {
    if (confirm('Are you sure you want to deactivate this account?')) {
      updateLgu({
        // passing the barangayCode here.
        barangayCode: barangayCode,
        data: { status: 'inactive' },
      });
    }
  };

  const handleActivate = (barangayCode: string) => {
    if (confirm('Are you sure you want to activate this account?')) {
      updateLgu({
        barangayCode: barangayCode,
        data: { status: 'active' },
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-20">
      <div className="border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#2a4263]">
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

        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="max-h-[600px] min-h-[300px] overflow-auto rounded-t-2xl">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="sticky top-0 z-20 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 uppercase shadow-sm">
                <tr>
                  <th className="bg-gray-50 px-6 py-4">LGU Name / Location</th>
                  <th className="bg-gray-50 px-6 py-4">Admin Email</th>
                  <th className="bg-gray-50 px-6 py-4 text-center">Users</th>
                  <th className="bg-gray-50 px-6 py-4">Status</th>
                  <th className="bg-gray-50 px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <LuLoader className="h-8 w-8 animate-spin text-[#2a4263]" />
                        <span className="text-gray-500">Loading LGUs...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-red-500"
                    >
                      Failed to load LGU data.
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      No tenants found matching {searchTerm}
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant: LguTenant, index: number) => {
                    const isLastRows = index >= filteredTenants.length - 2;
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
                            {/* Optional: Show Code for Debugging */}
                            <div className="text-[10px] text-gray-300">
                              Code: {tenant.id}
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
                        <td className="px-6 py-4">
                          <div
                            className={`badge ${tenant.status === 'active' ? 'badge-success text-white' : 'badge-ghost text-gray-500'} badge-sm p-3 font-semibold`}
                          >
                            {tenant.status === 'active' ? 'Active' : 'Inactive'}
                          </div>
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
                                  Edit Account
                                </button>
                              </li>
                              <li>
                                <button
                                  className={
                                    tenant.status === 'active'
                                      ? 'text-red-500'
                                      : 'text-green-600'
                                  }
                                  onClick={() =>
                                    tenant.status === 'active'
                                      ? handleDeactivate(tenant.id)
                                      : handleActivate(tenant.id)
                                  }
                                >
                                  {tenant.status === 'active'
                                    ? 'Deactivate'
                                    : 'Activate'}
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
        </div>
      </div>

      <EditLGUModal
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
