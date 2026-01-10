import { useState } from 'react';
import { IoMdMore } from 'react-icons/io';
import { LuSearch, LuPlus, LuMapPin, LuMail } from 'react-icons/lu';

import { useUpdateLgu } from '../api/edit-lgu';

import { AddLGUModal } from './add-lgu';
import { EditLGUModal } from './edit-lgu';

// --- Mock Data ---
const MOCK_TENANTS = [
  {
    id: '1',
    name: 'Brgy. Batong Malake',
    region: 'Calabarzon',
    province: 'Laguna',
    city: 'Los Baños',
    adminEmail: 'admin@batongmalake.gov.ph',
    status: 'active',
    registeredUsers: 1420,
  },
  {
    id: '2',
    name: 'Brgy. Mayondon',
    region: 'Calabarzon',
    province: 'Laguna',
    city: 'Los Baños',
    adminEmail: 'kapitan@mayondon.ph',
    status: 'active',
    registeredUsers: 850,
  },
  {
    id: '3',
    name: 'Brgy. San Antonio',
    region: 'Calabarzon',
    province: 'Laguna',
    city: 'Biñan',
    adminEmail: 'sec@sanantonio.gov',
    status: 'inactive',
    registeredUsers: 0,
  },
];

export function TenantManagerLayout() {
  const [searchTerm, setSearchTerm] = useState('');

  const [lguId, setLguId] = useState<string | null>(null); // For Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For Add

  const filteredTenants = MOCK_TENANTS.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.city.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedTenant = MOCK_TENANTS.find((t) => t.id === lguId);

  const { mutate: updateLgu } = useUpdateLgu();

  const handleDeactivate = (id: string) => {
    if (confirm('Are you sure you want to deactivate this account?')) {
      updateLgu({
        lguId: id,
        data: { status: 'inactive' },
      });
    }
  };

  const handleActivate = (id: string) => {
    if (confirm('Are you sure you want to activate this account?')) {
      updateLgu({
        lguId: id,
        data: { status: 'active' },
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-20">
      {/* --- Header Section --- */}
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
        {/* --- Toolbar --- */}
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

        {/* --- Data Table --- */}
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
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      No tenants found matching &#34;{searchTerm}&#34;
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant, index) => {
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
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <LuMail size={14} className="text-gray-400" />
                            {tenant.adminEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                            {tenant.registeredUsers} citizens
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {tenant.status === 'active' ? (
                            <div className="badge badge-success badge-sm gap-2 p-3 font-semibold text-white">
                              Active
                            </div>
                          ) : (
                            <div className="badge badge-ghost badge-sm gap-2 p-3 font-semibold text-gray-500">
                              Inactive
                            </div>
                          )}
                        </td>

                        {/* Actions */}
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
                              {/* Edit Button - Sets the ID to open the modal */}
                              <li>
                                <button
                                  onClick={() => setLguId(tenant.id)}
                                  className="font-medium text-gray-600"
                                >
                                  Edit Account
                                </button>
                              </li>
                              <li>
                                {tenant.status === 'active' ? (
                                  <button
                                    className="w-full rounded-md px-2 py-1 text-left font-medium text-red-500 hover:bg-red-50"
                                    onClick={() => handleDeactivate(tenant.id)}
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    className="w-full rounded-md px-2 py-1 text-left font-medium text-green-600 hover:bg-green-50"
                                    onClick={() => handleActivate(tenant.id)}
                                  >
                                    Activate
                                  </button>
                                )}
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                <tr className="h-32"></tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-500">
            <span>Showing {filteredTenants.length} results</span>
          </div>
        </div>
      </div>

      <EditLGUModal
        isOpen={!!lguId}
        tenant={selectedTenant}
        onClose={() => setLguId(null)}
      />

      <AddLGUModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

