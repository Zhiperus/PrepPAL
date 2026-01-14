import type { LeaderboardEntry } from '@repo/shared/dist/schemas/leaderboard.schema';
import { FaLocationDot } from 'react-icons/fa6';
import { LuSearch } from 'react-icons/lu';

interface LeaderboardListProps {
  title: string;
  data: LeaderboardEntry[];
  location: string;
  activeMetric: 'allTime' | 'goBag';
  search: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
}

export function LeaderboardList({
  title,
  data,
  location,
  activeMetric,
  search,
  onSearchChange,
  isLoading,
}: LeaderboardListProps) {
  return (
    <div className="relative flex w-full flex-col">
      {/* Header Section (Always Visible) */}
      <div className="bg-base-200/95 sticky top-0 z-30 w-full pt-4 pb-6 text-center backdrop-blur-sm">
        <h3 className="mb-2 text-lg font-semibold tracking-wider text-gray-500 uppercase">
          {title}
        </h3>
        <h1 className="text-text-primary mb-2 text-4xl font-extrabold">
          Leaderboard
        </h1>

        <span className="flex gap-3 justify-self-center text-sm font-medium text-gray-500">
          <FaLocationDot className="text-text-primary h-4 w-4 shrink-0" />
          {'Brgy. ' + location}
        </span>

        {/* Search Bar */}
        <div className="mt-5 flex justify-center px-4">
          <label className="input input-bordered flex w-full max-w-sm items-center gap-2 bg-white shadow-sm focus-within:border-transparent focus-within:ring-2 focus-within:ring-[#2a4263]">
            <LuSearch className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="grow"
              placeholder="Search neighbors..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* List Content */}
      <div className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto px-1 pb-4">
        {isLoading ? (
          // --- SKELETON LOADER ---
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Rank Skeleton */}
                <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
                {/* Avatar Skeleton */}
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                {/* Name Skeleton */}
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
              </div>
              {/* Score Skeleton */}
              <div className="h-6 w-12 animate-pulse rounded bg-gray-200"></div>
            </div>
          ))
        ) : data.length === 0 ? (
          // --- EMPTY STATE ---
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            {search ? (
              <>
                <p>No results found for {search}</p>
                <p className="text-sm">Try checking the spelling.</p>
              </>
            ) : (
              <p>No citizens found in this barangay yet.</p>
            )}
          </div>
        ) : (
          // --- ACTUAL DATA ---
          data.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-row items-center gap-4">
                <span className="w-8 text-center text-lg font-medium text-gray-400">
                  {user.rank}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500">
                    <div className="avatar">
                      <div className="rounded-full">
                        <img src={user.profileImage || ''} />
                      </div>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[#2a4263]">
                    {user.householdName}
                  </span>
                </div>
              </div>

              <span className="text-lg font-bold text-gray-700">
                {activeMetric === 'allTime'
                  ? user.totalPoints.toFixed(0)
                  : user.points.goBag.toFixed(0)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
