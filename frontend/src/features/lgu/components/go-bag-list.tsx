import { format } from 'date-fns';
import { useState, useMemo } from 'react';
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
} from 'react-icons/fi';
import { MdLocationOn } from 'react-icons/md';

import { useResidentGoBags } from '../api/get-go-bags'; // Fixed import path based on context

import { useUser } from '@/lib/auth';

// --- Types ---

interface GoBagItem {
  _id: string;
  name: string;
  category: string; // broadened string to match dynamic keys
  defaultQuantity: number;
}

interface User {
  _id: string;
  householdName: string;
  email: string;
  phoneNumber: string;
  location: {
    barangay: string;
    city: string;
  };
  householdInfo: {
    memberCount: number;
    pets: number;
    femaleCount: number;
  };
  points: {
    goBag: number;
  };
  profileImage: string | null;
}

interface PopulatedGoBag {
  _id: string;
  userId: User;
  imageUrl: string;
  items: GoBagItem[];
  lastUpdated: string;
  completeness: number;
}

// This matches the style of your Update Modal
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

// --- Helper Components ---

function StatusBadge({ points }: { points: number }) {
  if (points >= 80) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        <FaCheckCircle className="mr-1 h-3 w-3" />
        Prepared
      </span>
    );
  }
  if (points >= 50) {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
        <FiAlertCircle className="mr-1 h-3 w-3" />
        Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
      <FiAlertCircle className="mr-1 h-3 w-3" />
      At Risk
    </span>
  );
}

// --- Main Page Component ---

export default function LguGoBagDashboard() {
  const { data: user } = useUser();
  const { data: goBags, isLoading } = useResidentGoBags(user?.lguId || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBag, setSelectedBag] = useState<PopulatedGoBag | null>(null);

  // Filter Logic
  const filteredBags = useMemo(() => {
    if (!goBags) return [];
    return goBags.filter(
      (bag) =>
        bag.userId.householdName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        bag.userId.location.barangay
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, goBags]);

  // Grouping Logic for the Modal
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-gray-500">
        <span className="loading loading-spinner loading-lg text-blue-900"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header Stats */}
      <div className="mb-8">
        <h1 className="pt-10 text-xl font-bold text-slate-900">
          Resident Go Bags
        </h1>
        <p className="text-gray-500">
          Monitor preparedness levels across your LGU.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Stat Cards (Same as before) */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Households
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {goBags?.length || 0}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fully Prepared
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {goBags?.filter((u) => u.completeness >= 80).length || 0}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  At Risk (Low Score)
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {goBags?.filter((u) => u.completeness < 50).length || 0}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-200 bg-white p-4 md:flex-row">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search household or barangay..."
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FiFilter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Household
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Household Info
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No residents found.
                  </td>
                </tr>
              ) : (
                filteredBags.map((bag) => (
                  <tr
                    key={bag._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                          src={bag.userId.profileImage || ''}
                          alt=""
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {bag.userId.householdName || 'Unknown Household'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {bag.userId.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MdLocationOn className="mr-1.5 h-4 w-4 text-gray-400" />
                        {bag.userId.location?.barangay || 'N/A'},{' '}
                        {bag.userId.location?.city || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center" title="Members">
                          <FiUsers className="mr-1.5 h-3 w-3" />{' '}
                          {bag.userId.householdInfo?.memberCount || 0} Members
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge points={bag.completeness} />
                      <div className="mt-1 text-xs text-gray-400">
                        Score: {bag.completeness}/100
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1.5 h-3 w-3 text-gray-400" />
                        {format(new Date(bag.lastUpdated), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedBag(bag)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
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
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedBag && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedBag(null)}
          />

          {/* Drawer Panel */}
          <div className="animate-in slide-in-from-right relative h-full w-full max-w-2xl transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedBag.userId.householdName || 'Household Inspection'}
                </h2>
                <p className="text-sm text-gray-500">Go Bag Verification</p>
              </div>
              <button
                onClick={() => setSelectedBag(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-8 p-6">
              {/* Snapshot Image */}
              <div>
                <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-900 uppercase">
                  Verification Image
                </h3>
                <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  {selectedBag.imageUrl ? (
                    <>
                      <img
                        src={selectedBag.imageUrl}
                        alt="Go Bag Content"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-sm font-medium text-white">
                          Uploaded:{' '}
                          {format(new Date(selectedBag.lastUpdated), 'PPP p')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No Image Uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Status
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {selectedBag.completeness}
                    </span>
                    <StatusBadge points={selectedBag.completeness} />
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Items Count
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {selectedBag.items.length}
                    </span>
                    <FiPackage className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Items List - CATEGORIZED */}
              <div>
                <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-900 uppercase">
                  Inventory Checklist
                </h3>

                {selectedBag.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
                    <FiPackage className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      No items logged in this bag.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Render Categories */}
                    {Object.entries(groupedItems).map(([category, items]) => {
                      // Get config for this category
                      const config =
                        CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
                      const Icon = config.icon;

                      return (
                        <div
                          key={category}
                          className={`rounded-xl border ${config.border} overflow-hidden bg-white shadow-sm`}
                        >
                          {/* Category Header */}
                          <div
                            className={`flex items-center gap-3 border-b ${config.border} ${config.bg} px-4 py-3`}
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white ${config.color}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span
                              className={`font-bold capitalize ${config.color}`}
                            >
                              {category}
                            </span>
                            <span className="ml-auto text-xs font-medium text-gray-500">
                              {items.length} item{items.length !== 1 && 's'}
                            </span>
                          </div>

                          {/* Items in this Category */}
                          <div className="divide-y divide-gray-100">
                            {items.map((item) => (
                              <div
                                key={item._id}
                                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                              >
                                <div className="text-sm font-medium text-gray-700">
                                  {item.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Missing Essentials Recommendation */}
              {selectedBag.items.length < 5 && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-start">
                    <FiAlertCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-orange-600" />
                    <div>
                      <h4 className="text-sm font-bold text-orange-900">
                        Recommendation Needed
                      </h4>
                      <p className="mt-1 text-sm text-orange-800">
                        This household is missing key essentials (Water, Food).
                        Consider marking for LGU assistance distribution.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
