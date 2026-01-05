import { useState } from 'react';

import { LeaderboardList } from './tab-content';

import { MOCK_LEADERBOARD_RESPONSE, MOCK_USER_PROFILE } from '@/lib/mockData';

// data structure i used for leaderboard, not sure if this is correct , update if needed
// MOCK_LEADERBOARD_RESPONSE = [
//   { 
//     userId: "u_101", 
//     name: "Ria", 
//     points: { allTime: 123, goBag: 48 } 
//   },
//   { 
//     userId: "u_102", 
//     name: "Cruz", 
//     points: { allTime: 115, goBag: 42 } 
// ] },

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'allTime' | 'goBag'>('allTime');
  const brgy = MOCK_USER_PROFILE.location.barangay

  // sort data
  const sortedData = [...MOCK_LEADERBOARD_RESPONSE].sort((a, b) => {
    return b.points[activeTab] - a.points[activeTab];
  });

  return (
    <div className="bg-base-200 flex min-h-screen flex-col items-center pt-6 pb-20">
      
      <div role="tablist" className="tabs tabs-border tabs-lg w-full max-w-md justify-center">
        
        {/* All-time Tab */}
        <input 
            type="radio" 
            name="leaderboard_tabs" 
            role="tab" 
            className="tab font-bold text-gray-600 aria-selected:text-[#2a4263] min-w-[120px]" 
            aria-label="All-Time" 
            defaultChecked 
            onClick={() => setActiveTab('allTime')}
        />
        <div role="tabpanel" className="tab-content w-full bg-transparent p-4 col-span-2 border-none">
            <LeaderboardList 
                title="All-time Points"
                data={sortedData} 
                brgy={brgy}
                activeMetric="allTime"
            />
        </div>

        {/* Go Bag Tab */}
        <input 
            type="radio" 
            name="leaderboard_tabs" 
            role="tab" 
            className="tab font-bold text-gray-600 aria-selected:text-[#2a4263] min-w-[120px]" 
            aria-label="Go Bag" 
            onClick={() => setActiveTab('goBag')}
        />
        <div role="tabpanel" className="tab-content w-full bg-transparent p-4 col-span-2 border-none">
            <LeaderboardList 
                title="Go Bag Points" 
                data={sortedData}
                brgy={brgy}
                activeMetric="goBag"
            />
        </div>
      </div>
    </div>
  );
}
