import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import {
  FiFilter,
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

import { useCompleteQuestionReport } from '../api/complete-question-report';
import { useQuestionReports } from '../api/get-question-reports';

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

export default function QuestionModerationPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- 1. Pagination State ---
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // --- 2. Fetch with Pagination ---
  const {
    data: reportsData,
    isLoading,
    isPlaceholderData,
  } = useQuestionReports({
    status: 'PENDING',
    page,
    limit,
  });

  const reports = reportsData?.data || [];
  const meta = reportsData?.meta;

  // --- 3. Setup Mutation ---
  const { mutate, isPending, variables } = useCompleteQuestionReport({
    mutationConfig: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['question-reports'] });
        setSelectedId(null);
      },
    },
  });

  const isDismissing = isPending && variables?.status === 'DISMISSED';
  const isResolving = isPending && variables?.status === 'RESOLVED';

  // Ensure selection remains valid or defaults to first item
  const selectedReport =
    reports?.find((r) => r._id === selectedId) ||
    (reports?.length ? reports[0] : null);

  // Reset selection if list changes and previous selection is gone (Optional)
  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      setSelectedId(reports[0]._id);
    }
  }, [reports, selectedReport]);

  const handleAction = (status: 'DISMISSED' | 'RESOLVED') => {
    if (selectedReport) {
      mutate({ reportId: selectedReport._id, status });
    }
  };

  // --- 4. Pagination Handlers ---
  const handleNextPage = () => {
    if (!isPlaceholderData && meta && page < meta.totalPages) {
      setPage((old) => old + 1);
    }
  };

  const handlePrevPage = () => {
    setPage((old) => Math.max(old - 1, 1));
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
      <header className="mb-8 flex flex-col pt-12 lg:pt-2">
        <h1 className="text-text-primary text-3xl font-extrabold tracking-tight">
          Quiz Moderation
        </h1>
        <p className="text-gray-500">
          Review user-reported errors in module quizzes.
        </p>
      </header>

      <div className="grid h-[80vh] grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT PANEL: Report List */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-7">
          <div className="border-b border-slate-100 p-6">
            <h2 className="mb-4 text-left text-xl font-bold text-slate-900">
              Reported Questions
            </h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by module or reason..."
                  className="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-900/20 focus:outline-none"
                />
              </div>
              <button className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50">
                <FiFilter size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <div className="col-span-5 text-left">Module / Question</div>
            <div className="col-span-3 text-left">Reporter</div>
            <div className="col-span-4 text-left">Reason</div>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {reports.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <p>No pending question reports.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => setSelectedId(report._id)}
                  className={`grid cursor-pointer grid-cols-12 items-center gap-4 rounded-xl px-4 py-4 transition-colors ${
                    selectedReport?._id === report._id
                      ? 'border border-blue-100 bg-blue-50'
                      : 'border border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="col-span-5 flex flex-col text-left">
                    <span className="text-xs font-bold text-blue-800">
                      Module ID: {report.quizContext?.moduleId || 'N/A'}
                    </span>
                    <span className="truncate text-sm font-medium text-slate-700">
                      {report.quizContext?.reportedQuestion?.questionText ||
                        'Question text missing'}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center gap-2 text-left">
                    <Avatar
                      name={report.reporterId?.householdName || 'U'}
                      size="sm"
                    />
                    <span className="truncate text-xs font-medium">
                      {report.reporterId?.householdName}
                    </span>
                  </div>

                  <div className="col-span-4 text-left">
                    <span className="inline-block rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 uppercase">
                      {report.reason}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {meta && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3">
              <span className="text-xs text-slate-500">
                Page{' '}
                <span className="font-bold text-slate-700">{meta.page}</span> of{' '}
                <span className="font-bold text-slate-700">
                  {meta.totalPages}
                </span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={isPlaceholderData || page === meta.totalPages}
                  className="flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Question Detail View */}
        <div className="flex flex-col lg:col-span-5">
          {selectedReport ? (
            <div className="sticky top-6 flex h-fit flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-left font-bold text-slate-900">
                    Question Details
                  </h3>
                  <p className="text-left text-xs text-slate-500">
                    Reported on{' '}
                    {format(new Date(selectedReport.createdAt), 'MMM d, yyyy')}
                  </p>
                  <div className="text-left">
                    <a
                      href={`/admin/module-editor?edit=${selectedReport.quizContext?.moduleId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
                    >
                      <FiExternalLink size={16} />
                      Fix Module in New Tab
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                  <FiAlertTriangle size={14} />
                  <span className="text-xs font-bold">Pending Review</span>
                </div>
              </div>

              {/* Question Text Area */}
              <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
                <p className="mb-4 text-sm font-semibold text-slate-800">
                  {selectedReport.quizContext?.reportedQuestion?.questionText}
                </p>

                {/* Choices Display */}
                <div className="space-y-2">
                  {selectedReport.quizContext?.reportedQuestion?.choices.map(
                    (choice: any) => (
                      <div
                        key={choice.id}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                          choice.id ===
                          selectedReport.quizContext?.reportedQuestion
                            ?.correctAnswer
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <span>{choice.text}</span>
                        {choice.id ===
                          selectedReport.quizContext?.reportedQuestion
                            ?.correctAnswer && (
                          <FiCheckCircle className="text-green-600" />
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Reporter Info */}
              <div className="mb-6 rounded-xl border border-slate-200 p-4 text-left">
                <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Report Details
                </p>
                <p className="mb-3 text-sm text-slate-700 italic">
                  {selectedReport.reason}
                </p>
                <div className="flex items-center gap-2">
                  <Avatar
                    name={selectedReport.reporterId?.householdName}
                    size="sm"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    Reported by {selectedReport.reporterId?.householdName}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction('DISMISSED')}
                  disabled={isPending}
                  className="flex items-center justify-center rounded-xl border border-slate-300 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {isDismissing ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Dismiss Report'
                  )}
                </button>

                <button
                  onClick={() => handleAction('RESOLVED')}
                  disabled={isPending}
                  className="flex items-center justify-center rounded-xl bg-blue-900 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
                >
                  {isResolving ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Mark as Resolved'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-400">
              Select a question report to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
