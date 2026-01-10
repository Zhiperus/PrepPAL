import { useState, useMemo } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { GoSearch, GoDownload, GoCheckCircle, GoClock } from 'react-icons/go';
import { MdLocationOn, MdClose } from 'react-icons/md';

import { useLeaderboard } from '../api/get-leaderboard';

import { LguLeaderboardTable } from './lgu-leaderboard-table';

import { useUser } from '@/lib/auth';

type MetricType = 'allTime' | 'goBag';

export default function LguLeaderboardLayout() {
  const { data: user } = useUser();

  const [activeModalTab, setActiveModalTab] = useState<MetricType>('allTime');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const TARGET_BARANGAY = user?.location?.barangay;

  // --- API HOOKS (Fetch Real Data) ---

  // 1. Fetch ALL TIME Leaders (Top 50)
  const allTimeQuery = useLeaderboard({
    params: {
      barangay: TARGET_BARANGAY,
      metric: 'allTime',
      limit: 50,
    },
  });

  // 2. Fetch GO BAG Leaders (Top 50)
  const goBagQuery = useLeaderboard({
    params: {
      barangay: TARGET_BARANGAY,
      metric: 'goBag',
      limit: 50,
    },
  });

  // --- DATA PROCESSING ---
  const allTimeData = allTimeQuery.data?.data || [];
  const goBagData = goBagQuery.data?.data || [];

  console.log(allTimeData, goBagData);

  // Filter Logic for Modal (Client-side search)
  const modalDisplayData = useMemo(() => {
    const sourceData = activeModalTab === 'allTime' ? allTimeData : goBagData;

    if (!searchTerm) return sourceData;

    return sourceData.filter((item) =>
      item.householdName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [activeModalTab, searchTerm, allTimeData, goBagData]);

  // --- TOAST & DOWNLOAD STATES ---
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'loading' | 'success';
    message: string;
  }>({
    show: false,
    type: 'loading',
    message: '',
  });

  // --- DOWNLOAD HANDLER ---
  const handleDownloadReport = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setToast({
      show: true,
      type: 'loading',
      message: 'Generating Excel Report...',
    });

    setTimeout(() => {
      setIsDownloading(false);
      setToast({
        show: true,
        type: 'success',
        message: 'Report Downloaded Successfully!',
      });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    }, 2000);
  };

  const openModal = (tab: MetricType) => {
    setActiveModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-2 px-1">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="pt-10 text-4xl font-black tracking-tight text-[#2A4263] lg:pt-0">
              Leaderboard
            </h1>

            {/* Term Countdown Badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#0891B2]/20 bg-[#E0F7FA] px-3 py-1 text-xs font-bold text-[#0891B2] shadow-sm">
              <GoClock className="text-sm" />
              <span>Term ends in: 3 days</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
            <MdLocationOn className="text-xl text-[#2A4263]" />
            <span className="font-bold text-[#2A4263]">
              Brgy. {TARGET_BARANGAY}
            </span>
          </div>
        </div>

        {/* --- MAIN DASHBOARD (TWO CARDS) --- */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* CARD 1: ALL TIME */}
          <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2A4263]">All Time</h2>
            </div>
            <div className="flex-1">
              <LguLeaderboardTable
                data={allTimeData.slice(0, 5)}
                isLoading={allTimeQuery.isLoading}
                activeMetric="allTime"
              />
            </div>
            <button
              onClick={() => openModal('allTime')}
              className="mt-6 w-full rounded-xl bg-gray-50 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#2A4263]"
            >
              Show More
            </button>
          </div>

          {/* CARD 2: GO BAG */}
          <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2A4263]">Go Bag</h2>
            </div>
            <div className="flex-1">
              <LguLeaderboardTable
                data={goBagData.slice(0, 5)}
                isLoading={goBagQuery.isLoading}
                activeMetric="goBag"
              />
            </div>
            <button
              onClick={() => openModal('goBag')}
              className="mt-6 w-full rounded-xl bg-gray-50 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#2A4263]"
            >
              Show More
            </button>
          </div>
        </div>

        {/* --- DOWNLOAD BUTTON --- */}
        <div className="flex justify-center pb-8">
          <button
            disabled={isDownloading}
            className={`group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0891B2] px-8 py-3.5 text-sm font-bold transition-all active:scale-95 md:w-auto ${
              isDownloading
                ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                : 'bg-transparent text-[#0891B2] hover:bg-[#E0F7FA] hover:shadow-lg'
            }`}
            onClick={handleDownloadReport}
          >
            {isDownloading ? (
              <CgSpinner className="animate-spin text-lg" />
            ) : (
              <GoDownload
                size={18}
                className="transition-transform group-hover:-translate-y-0.5"
              />
            )}
            {isDownloading ? 'Processing...' : 'Download Detailed Report'}
          </button>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm duration-200">
          <div className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <h2 className="text-xl font-black text-[#2A4263]">
                Full Leaderboard
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                title="Close modal"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="flex flex-col gap-4 border-b border-gray-50 bg-gray-50/50 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex rounded-lg bg-gray-200 p-1">
                <button
                  onClick={() => setActiveModalTab('allTime')}
                  className={`rounded-md px-6 py-2 text-sm font-bold transition-all ${activeModalTab === 'allTime' ? 'bg-white text-[#2A4263] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setActiveModalTab('goBag')}
                  className={`rounded-md px-6 py-2 text-sm font-bold transition-all ${activeModalTab === 'goBag' ? 'bg-white text-[#2A4263] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Go Bag
                </button>
              </div>

              {/* Client-side Search */}
              <div className="relative w-full md:w-72">
                <GoSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search list..."
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white pr-4 pl-10 text-sm transition-all outline-none focus:border-[#2A4263] focus:ring-2 focus:ring-[#2A4263]/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white p-6">
              <LguLeaderboardTable
                data={modalDisplayData}
                isLoading={
                  activeModalTab === 'allTime'
                    ? allTimeQuery.isLoading
                    : goBagQuery.isLoading
                }
                activeMetric={activeModalTab}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST --- */}
      <div
        className={`toast toast-end toast-bottom z-50 transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'}`}
      >
        <div
          className={`alert flex items-center gap-3 font-bold shadow-lg ${
            toast.type === 'loading'
              ? 'bg-[#2A4263] text-white'
              : 'border border-[#10B981]/20 bg-[#D1FAE5] text-[#10B981]'
          }`}
        >
          {toast.type === 'loading' ? (
            <CgSpinner className="animate-spin text-xl" />
          ) : (
            <GoCheckCircle className="text-xl" />
          )}
          <span>{toast.message}</span>
        </div>
      </div>
    </div>
  );
}
