import { useState } from 'react';
import {
  FaThumbsUp,
  FaFirstAid,
  FaUtensils,
  FaLightbulb,
  FaCheckCircle,
  FaShieldAlt,
  FaBatteryFull,
  FaTshirt,
  FaIdCard,
} from 'react-icons/fa';
import {
  FiActivity,
  FiAlertCircle,
  FiFileText,
  FiUsers,
  FiDroplet,
  FiAlertTriangle,
  FiPackage,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { MdLocationOn } from 'react-icons/md';

// Import your hooks
//
import {
  useGoBagAnalytics,
  type ItemStat,
  type ReadinessStat,
} from '@/features/lgu/api/get-go-bag-analytics';
import { useLguDashboardMetrics } from '@/features/lgu/api/get-lgu-dashboard-metrics';
import { useUser } from '@/lib/auth';
// --- HELPER: GEOMETRY FOR GAUGE ---
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
}

function PreparednessGauge({ score }: { score: number }) {
  const size = 180;
  const strokeWidth = 18;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  const startAngle = -120;
  const endAngle = 120;
  const totalRange = endAngle - startAngle;
  const scoreAngle = startAngle + totalRange * (score / 100);

  const backgroundArc = describeArc(
    center,
    center,
    radius,
    startAngle,
    endAngle,
  );
  const progressArc = describeArc(
    center,
    center,
    radius,
    startAngle,
    scoreAngle,
  );

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track (Gray) */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress (Blue) */}
        <path
          d={progressArc}
          fill="none"
          stroke="#1e3a8a"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a]">
          <FaThumbsUp size={14} />
        </div>
        <span className="text-5xl leading-none font-extrabold text-[#1e3a8a]">
          {score}%
        </span>
        <span className="mt-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Ready
        </span>
      </div>
    </div>
  );
}

// 3. Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  theme = 'default',
}: {
  icon: any;
  label: string;
  value: number | string;
  theme?: 'default' | 'warning' | 'success' | 'info';
}) {
  const styles = {
    default: {
      bg: 'bg-white',
      iconBg: 'bg-slate-50',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-800',
    },
    success: {
      bg: 'bg-white',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-slate-800',
    },
    info: {
      bg: 'bg-white',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-slate-800',
    },
    warning: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
    },
  };
  const s = styles[theme];

  return (
    <div
      className={`border-border-container flex items-center justify-between rounded-2xl border p-6 shadow-sm ${s.bg}`}
    >
      <div className="flex flex-col">
        <span className={`text-3xl font-bold ${s.valueColor}`}>{value}</span>
        <span className="text-text-secondary mt-1 text-xs font-bold tracking-wider uppercase opacity-70">
          {label}
        </span>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.iconBg} ${s.iconColor}`}
      >
        <Icon size={22} />
      </div>
    </div>
  );
}

// 4. Go Bag Breakdown Component (Dynamic)
// Maps item names to icons/colors and renders progress bars
const ITEM_CONFIG: Record<string, any> = {
  water: { icon: FiDroplet, color: 'text-blue-500', bg: 'bg-blue-500' },
  food: { icon: FaUtensils, color: 'text-orange-500', bg: 'bg-orange-500' },
  medicine: { icon: FaFirstAid, color: 'text-red-500', bg: 'bg-red-500' },
  'first aid': { icon: FaFirstAid, color: 'text-red-500', bg: 'bg-red-500' },
  light: { icon: FaLightbulb, color: 'text-yellow-500', bg: 'bg-yellow-500' },
  battery: {
    icon: FaBatteryFull,
    color: 'text-purple-500',
    bg: 'bg-purple-500',
  },
  clothes: { icon: FaTshirt, color: 'text-indigo-500', bg: 'bg-indigo-500' },
  documents: { icon: FaIdCard, color: 'text-slate-500', bg: 'bg-slate-500' },
};

function GoBagBreakdown({ data }: { data?: ItemStat[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Skeleton / Empty State
  if (!data)
    return (
      <div className="border-border-container h-full w-full animate-pulse rounded-2xl border bg-white p-6" />
    );

  // Pagination Logic
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="border-border-container flex h-full flex-col rounded-2xl border bg-white p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-text-primary text-lg font-bold">
          Go Bag Content Analysis
        </h3>
        {/* Optional: Show total count badge */}
        {data.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {data.length} Items
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          No data available yet.
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-5">
            {currentItems.map((item) => {
              // Find config based on name matching, or default
              const itemNameLower = item.name.toLowerCase();
              const configKey = Object.keys(ITEM_CONFIG).find((k) =>
                itemNameLower.includes(k),
              );
              const config = configKey
                ? ITEM_CONFIG[configKey]
                : {
                    icon: FiPackage,
                    color: 'text-slate-500',
                    bg: 'bg-slate-500',
                  };
              const Icon = config.icon;

              return (
                <div key={item.name} className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 ${config.color}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-text-primary font-medium capitalize">
                        {item.name}
                      </span>
                      <span className="text-text-secondary font-bold">
                        {item.count}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-100">
                      <div
                        className={`h-2.5 rounded-full ${config.bg}`}
                        style={{ width: `${item.count}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls - Only show if necessary */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-medium text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
// 5. Readiness Distribution Component (Dynamic)
function ReadinessDistribution({ data }: { data?: ReadinessStat }) {
  if (!data)
    return (
      <div className="h-64 animate-pulse rounded-2xl border bg-white p-6" />
    );

  const { fullyPrepared, partiallyPrepared, atRisk, total } = data;

  // Handle the case where no citizens have verified bags yet
  if (total === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-8">
        <FiPackage className="mb-2 text-4xl text-slate-300" />
        <p className="font-medium text-slate-500">
          No verified citizen data found.
        </p>
        <p className="mt-1 text-center text-xs text-slate-400">
          Once citizen reports are approved, their readiness status will appear
          here.
        </p>
      </div>
    );
  }

  const getPct = (val: number) => Math.round((val / total) * 100);

  const categories = [
    {
      label: 'Fully Prepared',
      count: fullyPrepared,
      pct: getPct(fullyPrepared),
      icon: FaShieldAlt,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      bar: 'bg-emerald-500',
      desc: '80-100% complete',
    },
    {
      label: 'Partially Prepared',
      count: partiallyPrepared,
      pct: getPct(partiallyPrepared),
      icon: FaCheckCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      bar: 'bg-amber-500',
      desc: '40-79% complete',
    },
    {
      label: 'At Risk',
      count: atRisk,
      pct: getPct(atRisk),
      icon: FiAlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
      bar: 'bg-red-500',
      desc: 'Below 40% complete',
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 md:p-8">
      <h3 className="text-lg font-bold text-slate-800">
        Citizen Readiness Distribution
      </h3>
      <p className="mb-6 text-sm text-slate-500">
        Based on latest verified Go Bags.
      </p>

      <div className="flex-1 space-y-6">
        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="mb-2 flex items-end justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${cat.bg} ${cat.color}`}>
                  <cat.icon />
                </div>
                <div>
                  <p className="leading-none font-bold text-slate-700">
                    {cat.label}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400 uppercase">
                    {cat.desc}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-slate-800">
                  {cat.pct}%
                </span>
                <p className="text-[10px] text-slate-400">
                  {cat.count} Citizens
                </p>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full ${cat.bar} transition-all duration-1000`}
                style={{ width: `${cat.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// --- MAIN PAGE ---

export default function LguDashboardPage() {
  const { data: user } = useUser();
  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
  } = useLguDashboardMetrics();

  const lguId = user?.lguId || '';

  const { data: analyticsData } = useGoBagAnalytics(lguId);

  // Loading State
  if (isMetricsLoading) {
    return (
      <div className="bg-bg-page flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-btn-primary"></span>
      </div>
    );
  }

  // Error State
  if (isMetricsError || !metricsData) {
    return (
      <div className="bg-bg-page text-text-error flex min-h-screen items-center justify-center">
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  const { lguDetails, overall, reports, engagement } = metricsData.data;

  return (
    <div className="bg-bg-page min-h-screen w-full p-6 font-sans md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* HEADER */}
        <header className="flex flex-col gap-4 pt-10 md:flex-row md:items-center md:justify-between lg:pt-0">
          <div>
            <h1 className="text-text-primary text-3xl font-bold tracking-tight">
              {lguDetails.name}
            </h1>
            <div className="text-text-secondary mt-1 flex items-center gap-1.5 text-sm">
              <MdLocationOn className="text-text-primary text-lg" />
              {lguDetails.location}
            </div>
          </div>
        </header>

        {/* TOP ROW GRID */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* HERO GAUGE (Span 5) */}
          <div className="md:col-span-5">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-white bg-[#E0F7FA] p-8 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-extrabold text-[#1e3a8a]">
                  Overall Preparedness
                </h2>
                <p className="mt-1 text-sm font-medium text-[#1e3a8a]/70">
                  Track your barangay&apos;s readiness in real-time.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <PreparednessGauge score={overall.averageScore} />
              </div>
            </div>
          </div>

          {/* METRICS CARDS (Span 7) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-7 md:grid-rows-2">
            <StatCard
              icon={FiUsers}
              label="Registered Citizens"
              value={overall.totalCitizens.toLocaleString()}
              theme="default"
            />
            <StatCard
              icon={FiActivity}
              label="Active This Week"
              value={engagement.activeThisWeek.toLocaleString()}
              theme="success"
            />
            <StatCard
              icon={FiFileText}
              label="Total Reports"
              value={reports.total}
              theme="info"
            />
            <StatCard
              icon={FiAlertCircle}
              label="Pending Review"
              value={reports.pending}
              theme={reports.pending > 0 ? 'warning' : 'default'}
            />
          </div>
        </div>

        {/* BOTTOM SECTION: DETAILED ANALYTICS */}
        {/* Pass the data from the new hook to these components */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: Item Breakdown */}
          <GoBagBreakdown data={analyticsData?.itemBreakdown} />

          {/* Right: Readiness Distribution */}
          <ReadinessDistribution data={analyticsData?.distribution} />
        </div>
      </div>
    </div>
  );
}
