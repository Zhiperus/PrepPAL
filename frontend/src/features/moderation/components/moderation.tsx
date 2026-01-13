import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';

import { useCompleteReport } from '../api/complete-report';
import { useContentReports } from '../api/get-reports';

import { useUser } from '@/lib/auth';

// --- Helper Components ---

function Avatar({
  src,
  name,
  size = 'md',
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
        ? 'w-12 h-12 text-sm'
        : 'w-10 h-10 text-xs';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full border border-gray-200 object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full border border-slate-300 bg-slate-200 font-bold text-slate-600`}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

// --- Props Definition ---

interface ModerationPageProps {
  /**
   * Optional: Overrides the logged-in user's barangay code.
   * - If provided, filters by this code.
   * - If omitted for Super Admin, shows ALL reports.
   * - If omitted for LGU Admin, defaults to their own code.
   */
  barangayCode?: string | null;
}

// --- Main Page ---

export default function ModerationPage({
  barangayCode: propBarangayCode,
}: ModerationPageProps) {
  const user = useUser();
  const queryClient = useQueryClient();

  // Determine the target code to filter by
  const targetCode =
    propBarangayCode !== undefined
      ? propBarangayCode
      : user.data?.location?.barangayCode;

  // 1. Fetch Reports (Pass undefined if no code exists to fetch ALL)
  const { data: reportsData, isLoading } = useContentReports({
    barangayCode: targetCode || undefined,
  });
  const reports = reportsData?.data;

  // 2. Setup Single Mutation
  const { mutate, isPending, variables } = useCompleteReport({
    mutationConfig: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['content-reports'] });
        setSelectedId(null);
      },
    },
  });

  // Helpers to track which specific action is loading
  const isDismissing = isPending && variables?.status === 'DISMISSED';
  const isResolving = isPending && variables?.status === 'RESOLVED';

  // State for selection
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedReport =
    reports?.find((r) => r._id === selectedId) || reports?.[0];

  // Handlers
  const handleDismiss = () => {
    if (selectedReport) {
      mutate({ reportId: selectedReport._id, status: 'DISMISSED' });
    }
  };

  const handleDelete = () => {
    if (selectedReport) {
      // Backend: "RESOLVED" status triggers the delete post logic
      mutate({ reportId: selectedReport._id, status: 'RESOLVED' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <span className="loading loading-spinner loading-lg text-blue-900"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 md:p-10">
      {/* Header */}
      <header className="mb-8 flex flex-col pt-12 lg:pt-2">
        <h1 className="text-text-primary text-3xl font-extrabold tracking-tight">
          Moderation {targetCode ? '(Local)' : '(Global)'}
        </h1>
        <p className="text-gray-500">
          Review flagged submissions and manage community reports.
        </p>
      </header>

      <div className="grid h-[80vh] grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT PANEL: Report List */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-7">
          <div className="border-b border-slate-100 p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Flagged Go-bag Posts
            </h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-900/20 focus:outline-none"
                />
              </div>
              <button className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50">
                <FiFilter size={20} />
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <div className="col-span-4">User</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Sender</div>
            <div className="col-span-3">Reason</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {reports?.map((report) => (
              <div
                key={report._id}
                onClick={() => setSelectedId(report._id)}
                className={`grid cursor-pointer grid-cols-12 items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                  selectedReport?._id === report._id
                    ? 'border border-blue-100 bg-blue-50'
                    : 'border border-transparent hover:bg-slate-50'
                }`}
              >
                {/* User Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar
                    src={report.postId?.userId?.profileImage}
                    name={report.postId?.userId?.householdName || 'Unknown'}
                    size="sm"
                  />
                  <span className="truncate text-sm font-semibold">
                    {report.postId?.userId?.householdName || 'Deleted User'}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-3 text-xs font-medium text-slate-500">
                  {format(new Date(report.createdAt), 'MMMM d, yyyy')}
                </div>

                {/* Reporter */}
                <div className="col-span-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                    <Avatar
                      src={report.reporterId.profileImage}
                      name={report.reporterId?.householdName || 'Unknown'}
                      size="sm"
                    />
                  </div>
                  <span className="truncate text-xs">
                    {report.reporterId.householdName}
                  </span>
                </div>

                {/* Reason */}
                <div className="col-span-3">
                  <span className="inline-block max-w-full truncate rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 uppercase">
                    {report.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Detail Card */}
        <div className="flex flex-col lg:col-span-5">
          {selectedReport ? (
            <div className="sticky top-6 flex h-fit flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* Card Header */}
              <div className="mb-4 flex items-center gap-3">
                <Avatar
                  src={selectedReport.postId?.userId?.profileImage}
                  name={
                    selectedReport.postId?.userId?.householdName || 'Unknown'
                  }
                  size="md"
                />
                <div>
                  <h3 className="font-bold text-slate-900">
                    {selectedReport.postId?.userId?.householdName ||
                      'Deleted User'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedReport.postId?.createdAt
                      ? format(
                          new Date(selectedReport.postId.createdAt),
                          'MMMM d, yyyy',
                        )
                      : 'Unknown Date'}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                {selectedReport.postId?.imageUrl ? (
                  <div className="mb-3 overflow-hidden rounded-xl border border-slate-100">
                    <img
                      src={selectedReport.postId.imageUrl}
                      alt="Flagged content"
                      className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                    No Image Content
                  </div>
                )}

                {selectedReport.postId?.caption && (
                  <p className="mb-3 text-sm text-slate-600">
                    {selectedReport.postId.caption}
                  </p>
                )}

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1 text-xs font-bold text-slate-500 uppercase">
                    Reported For:
                  </p>
                  <p className="text-sm text-slate-800 italic">
                    {selectedReport.reason}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-3">
                <button
                  onClick={handleDismiss}
                  disabled={isPending} // Disable both when either is loading
                  className="flex w-full items-center justify-center rounded-xl bg-[#2a4263] py-3 font-bold text-white shadow-sm transition-colors hover:bg-[#1e3a8a] disabled:opacity-50"
                >
                  {isDismissing ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Dismiss'
                  )}
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex w-full items-center justify-center rounded-xl bg-[#2a4263] py-3 font-bold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {isResolving ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Delete Post'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-400">
              Select a report to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
