import { format } from 'date-fns';
import { useState, useMemo } from 'react';
// Icons
import {
  FaCheckCircle,
  FaUtensils,
  FaFirstAid,
  FaTools,
  FaTshirt,
  FaIdCard,
  FaBath,
  FaBolt,
} from 'react-icons/fa';
import {
  FiSearch,
  FiFilter,
  FiUsers,
  FiCalendar,
  FiAlertCircle,
  FiPackage,
  FiDroplet,
  FiSmartphone,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
} from 'react-icons/fi';
import { MdLocationOn } from 'react-icons/md';

// Hooks
import {
  useResidentGoBags,
  type PopulatedGoBag,
  type GoBagItem,
} from '../api/get-go-bags';

import { useUser } from '@/lib/auth';

// --- CONFIGURATION ---

// Style configuration for item categories in the modal
const CATEGORY_CONFIG: Record<
  string,
  { icon: any; color: string; bg: string; border: string }
> = {
  food: {
    icon: FaUtensils,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  water: {
    icon: FiDroplet,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  'first-aid': {
    icon: FaFirstAid,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  medicine: {
    icon: FaFirstAid,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  tools: {
    icon: FaTools,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-100',
  },
  tech: {
    icon: FiSmartphone,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  power: {
    icon: FaBolt,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
  },
  clothing: {
    icon: FaTshirt,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  documents: {
    icon: FaIdCard,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  hygiene: {
    icon: FaBath,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  default: {
    icon: FiPackage,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  },
};

// --- HELPER COMPONENTS ---

function StatusBadge({ points }: { points: number }) {
  if (points >= 80) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
        <FaCheckCircle className="text-emerald-600" /> Prepared
      </span>
    );
  }
  if (points >= 50) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
        <FiAlertCircle className="text-amber-600" /> Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
      <FiAlertCircle className="text-red-600" /> At Risk
    </span>
  );
}

// --- MAIN COMPONENT ---

export default function LguGoBagDashboard() {
  const { data: user } = useUser();

  // 1. Fetch Data
  const { data: goBagsData, isLoading } = useResidentGoBags(
    user?.location?.barangayCode || '',
  );
  const goBags = goBagsData?.data;

  // 2. Local State for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBag, setSelectedBag] = useState<PopulatedGoBag | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'prepared' | 'partial' | 'risk'
  >('all');
  const [sortBy, setSortBy] = useState<'recent' | 'score_desc' | 'score_asc'>(
    'recent',
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 4. Filter & Sort Logic
  const filteredData = useMemo(() => {
    if (!goBags) return [];

    let result = [...goBags];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (bag) =>
          bag.userId.householdName.toLowerCase().includes(lower) ||
          bag.userId.location.barangay.toLowerCase().includes(lower),
      );
    }

    // Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'prepared')
        result = result.filter((b) => b.completeness >= 80);
      else if (statusFilter === 'partial')
        result = result.filter(
          (b) => b.completeness >= 50 && b.completeness < 80,
        );
      else if (statusFilter === 'risk')
        result = result.filter((b) => b.completeness < 50);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'score_desc') return b.completeness - a.completeness;
      if (sortBy === 'score_asc') return a.completeness - b.completeness;
      // Default: recent
      return (
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    });

    return result;
  }, [goBags, searchTerm, statusFilter, sortBy]);

  // 5. Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // 6. Modal Grouping Logic
  const groupedItems = useMemo(() => {
    if (!selectedBag?.items) return {};
    return selectedBag.items.reduce(
      (acc, item) => {
        const catKey = item.category.toLowerCase();
        if (!acc[catKey]) acc[catKey] = [];
        acc[catKey].push(item);
        return acc;
      },
      {} as Record<string, GoBagItem[]>,
    );
  }, [selectedBag]);

  // --- RENDER ---

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <span className="loading loading-spinner loading-lg text-[#2a4263]"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER SECTION */}
        <header className="mb-8 pt-10 lg:pt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2a4263]">
            Resident Monitoring
          </h1>
          <p className="mt-2 text-gray-500">
            Review submitted Go Bags and monitor preparedness levels across{' '}
            {user?.location?.city}.
          </p>

          {/* Quick Stats Grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Households
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#2a4263]">
                    {goBags?.length || 0}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <FiUsers size={24} />
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Fully Prepared
                  </p>
                  <p className="mt-1 text-3xl font-bold text-emerald-600">
                    {goBags?.filter((b) => b.completeness >= 80).length || 0}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <FaCheckCircle size={24} />
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">At Risk</p>
                  <p className="mt-1 text-3xl font-bold text-red-600">
                    {goBags?.filter((b) => b.completeness < 50).length || 0}
                  </p>
                </div>
                <div className="rounded-xl bg-red-50 p-3 text-red-600">
                  <FiAlertCircle size={24} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTROLS & TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              {/* Search */}
              <div className="relative w-full lg:w-96">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search household or barangay..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset page on search
                  }}
                />
              </div>

              {/* Toggle Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-ghost border-gray-300'}`}
              >
                <FiFilter /> Filters
                <FiChevronDown
                  className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 sm:grid-cols-3">
              <div>
                <label className="label text-xs font-bold text-gray-500 uppercase">
                  Status
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="prepared">Fully Prepared</option>
                  <option value="partial">Partially Prepared</option>
                  <option value="risk">At Risk</option>
                </select>
              </div>
              <div>
                <label className="label text-xs font-bold text-gray-500 uppercase">
                  Sort By
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="score_desc">Highest Score</option>
                  <option value="score_asc">Lowest Score</option>
                </select>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th>Household</th>
                  <th>Location</th>
                  <th>Info</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      No households found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((bag) => (
                    <tr key={bag._id} className="hover:bg-gray-50">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle h-10 w-10 bg-gray-200">
                              <img
                                src={
                                  bag.userId.profileImage ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${bag.userId.householdName}`
                                }
                                alt="Profile"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-[#2a4263]">
                              {bag.userId.householdName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {bag.userId.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MdLocationOn className="text-gray-400" />
                          <span className="font-medium">
                            {bag.userId.location.barangay}
                          </span>
                        </div>
                        <div className="pl-5 text-xs text-gray-400">
                          {bag.userId.location.city}
                        </div>
                      </td>
                      <td>
                        <div className="badge badge-ghost gap-1 text-xs">
                          <FiUsers /> {bag.userId.householdInfo.memberCount}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <StatusBadge points={bag.completeness} />
                          <span className="text-[10px] font-medium text-gray-400">
                            {bag.completeness}% Score
                          </span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiCalendar />{' '}
                          {format(new Date(bag.lastUpdated), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedBag(bag)}
                          className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {paginatedData.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 p-4">
              <span className="text-sm text-gray-500">
                Page <strong>{currentPage}</strong> of{' '}
                <strong>{totalPages}</strong> ({filteredData.length} items)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline btn-sm"
                >
                  <FiChevronLeft />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="btn btn-outline btn-sm"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- DETAIL MODAL (Slide-over) --- */}
      {selectedBag && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedBag(null)}
          />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform transition-transform duration-300">
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                {/* Modal Header */}
                <div className="bg-[#2a4263] px-4 py-6 text-white sm:px-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold">
                        {selectedBag.userId.householdName}
                      </h2>
                      <p className="text-sm text-blue-100">
                        Go Bag Verification
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedBag(null)}
                      className="rounded-full bg-white/10 p-1 text-white hover:bg-white/20"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 px-4 py-6 sm:px-6">
                  {/* Bag Image */}
                  <div className="group relative mb-6 aspect-video w-full overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
                    {selectedBag.imageUrl ? (
                      <>
                        <img
                          src={selectedBag.imageUrl}
                          alt="Bag Content"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="absolute bottom-3 left-3 text-xs text-white">
                            Verified on{' '}
                            {format(new Date(selectedBag.lastUpdated), 'PPP')}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-gray-400">
                        <FiPackage size={32} />
                        <span className="mt-2 text-sm">No Image Uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* Readiness Score Card */}
                  <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase">
                          Completeness Score
                        </p>
                        <p className="text-3xl font-black text-[#2a4263]">
                          {selectedBag.completeness}%
                        </p>
                      </div>
                      <div className="scale-125">
                        <StatusBadge points={selectedBag.completeness} />
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-6">
                    <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-bold text-gray-900">
                      <FiPackage className="text-blue-600" /> Inventory
                      Checklist
                    </h3>

                    {selectedBag.items.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                        No items have been logged yet.
                      </div>
                    ) : (
                      Object.entries(groupedItems).map(([category, items]) => {
                        const config =
                          CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
                        const Icon = config.icon;

                        return (
                          <div
                            key={category}
                            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                          >
                            <div
                              className={`flex items-center justify-between border-b ${config.border} ${config.bg} px-4 py-2`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={config.color} />
                                <span
                                  className={`text-sm font-bold capitalize ${config.color}`}
                                >
                                  {category}
                                </span>
                              </div>
                              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-500">
                                {items.length}
                              </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                              {items.map((item) => (
                                <div
                                  key={item._id}
                                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
                                >
                                  <span className="font-medium text-gray-700">
                                    {item.name}
                                  </span>
                                  {/* If you had quantity in the schema, you'd show it here */}
                                  <FaCheckCircle
                                    className="text-emerald-400"
                                    size={14}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Alert for low scores */}
                  {selectedBag.completeness < 50 && (
                    <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
                      <div className="flex gap-3">
                        <FiAlertCircle className="mt-0.5 shrink-0 text-red-600" />
                        <div>
                          <h4 className="text-sm font-bold text-red-800">
                            Assistance Recommended
                          </h4>
                          <p className="mt-1 text-xs text-red-600">
                            This household is missing critical survival items
                            (Food, Water). Consider flagging for relief
                            distribution.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
