import type { LeaderboardEntry } from '@repo/shared/dist/schemas/leaderboard.schema';
import { GoShieldCheck } from 'react-icons/go';

import { cn } from '@/utils/cn';

interface LguLeaderboardTableProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
  activeMetric: 'allTime' | 'goBag';
}

export function LguLeaderboardTable({ data, isLoading, activeMetric }: LguLeaderboardTableProps) {
  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-gray-500">
        <GoShieldCheck size={48} className="mb-2 opacity-20" />
        <p>No leaderboard data available.</p>
      </div>
    );
  }

  // --- HELPER PARA SA COLOR CODING (Border & Background lang) ---
  const getRankBorderColor = (rank: number) => {
    if (rank <= 5) return 'border-l-[#4E8E2E] bg-green-50/30'; // Top 5 (Green)
    if (rank <= 15) return 'border-l-[#A88942] bg-yellow-50/30'; // Next 10 (Gold/Brown)
    return 'border-l-[#EF4444] bg-red-50/30'; // The Rest (Red)
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <table className="w-full text-left border-collapse">
        {/* Header */}
        <thead className="hidden bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-500 md:table-header-group">
          <tr>
            <th className="px-6 py-4 w-24">Rank</th>
            <th className="px-6 py-4">Household Name</th>
            <th className="px-6 py-4 text-right">Total Points</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-gray-100">
          {data.map((entry) => (
            <tr 
              key={entry._id} 
              // Apply Border & Background Color Logic
              className={cn(
                "group flex flex-col items-center gap-2 p-4 transition-all hover:brightness-95 md:table-row md:p-0",
                "border-l-[6px]", 
                getRankBorderColor(entry.rank)
              )}
            >
              {/* RANK */}
              <td className="flex w-full items-center justify-between md:table-cell md:w-auto md:px-6 md:py-4">
                <span className="text-xs font-bold uppercase text-gray-400 md:hidden">Rank</span>
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full font-black text-sm shadow-sm',
                  // Rank Circle Colors
                  entry.rank <= 5 ? 'bg-[#4E8E2E] text-white' : 
                  entry.rank <= 15 ? 'bg-[#A88942] text-white' : 
                  'bg-gray-100 text-gray-500'
                )}>
                  {entry.rank}
                </div>
              </td>

              {/* NAME */}
              <td className="w-full text-center md:table-cell md:text-left md:px-6 md:py-4">
                <div className="font-bold text-[#2A4263] text-lg md:text-base">
                  {entry.householdName}
                </div>
                <div className="text-xs font-medium text-gray-400 md:hidden">
                  {entry.location?.barangay}
                </div>
              </td>

              {/* POINTS - REVERTED TO SINGLE COLOR */}
              <td className="flex w-full items-center justify-between border-t border-gray-50 pt-3 md:table-cell md:border-none md:pt-4 md:text-right md:px-6">
                <span className="text-xs font-bold uppercase text-gray-400 md:hidden">Total Points</span>
                
                {/* Fixed Color: #2A4263 (Primary Blue) */}
                <span className="font-black tracking-tight text-[#2A4263] text-xl md:text-base">
                  {activeMetric === 'allTime' 
                    ? entry.totalPoints?.toLocaleString() 
                    : (entry.points as any)?.goBag?.toLocaleString() || 0}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}