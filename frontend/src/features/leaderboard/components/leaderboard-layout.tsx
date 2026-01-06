import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';

import { LeaderboardList } from '../components/leaderboard-list';

import { useLeaderboard } from '@/features/leaderboard/api/get-leaderboard';
import { useDebounce } from '@/hooks/use-debounce';
import { useUser } from '@/lib/auth';

export default function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab =
    (searchParams.get('tab') as 'allTime' | 'goBag') || 'allTime';
  const urlSearch = searchParams.get('q') || '';

  const [localSearch, setLocalSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (debouncedSearch) {
        newParams.set('q', debouncedSearch);
      } else {
        newParams.delete('q');
      }
      if (!newParams.has('tab')) {
        newParams.set('tab', activeTab);
      }
      return newParams;
    });
  }, [debouncedSearch, setSearchParams, activeTab]);

  const handleTabChange = (tab: 'allTime' | 'goBag') => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', tab);
      return newParams;
    });
  };

  const { data: user, isLoading: isUserLoading } = useUser();
  const userBarangay = user?.location?.barangay;

  const { data: leaderboardData, isLoading: isLeaderboardLoading } =
    useLeaderboard({
      params: {
        barangay: userBarangay,
        limit: 50,
        search: urlSearch,
        metric: activeTab,
      },
      queryConfig: {
        enabled: !!userBarangay,
        placeholderData: (previousData) => previousData,
      },
    });

  if (isUserLoading) {
    return (
      <div className="bg-base-200 flex h-screen w-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#2a4263]"></span>
      </div>
    );
  }

  return (
    <div className="bg-base-200 flex min-h-screen flex-col items-center pt-6 pb-20">
      <div
        role="tablist"
        className="tabs tabs-border tabs-lg w-full max-w-md justify-center"
      >
        <a
          role="tab"
          className={`tab min-w-[120px] font-bold text-gray-600 transition-colors ${
            activeTab === 'allTime'
              ? 'tab-active aria-selected:text-[#2a4263]'
              : ''
          }`}
          onClick={() => handleTabChange('allTime')}
        >
          All-Time
        </a>
        <a
          role="tab"
          className={`tab min-w-[120px] font-bold text-gray-600 transition-colors ${
            activeTab === 'goBag'
              ? 'tab-active aria-selected:text-[#2a4263]'
              : ''
          }`}
          onClick={() => handleTabChange('goBag')}
        >
          Go Bag
        </a>
      </div>

      <div className="w-full max-w-md p-4">
        <LeaderboardList
          title={activeTab === 'allTime' ? 'All-time Points' : 'Go Bag Points'}
          data={leaderboardData?.data || []}
          location={
            userBarangay
              ? `${userBarangay}, ${user?.location?.city}`
              : 'Unknown Location'
          }
          activeMetric={activeTab}
          search={localSearch}
          onSearchChange={setLocalSearch}
          isLoading={isLeaderboardLoading}
        />
      </div>
    </div>
  );
}
