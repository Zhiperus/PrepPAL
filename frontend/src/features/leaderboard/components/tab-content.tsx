import { MOCK_LEADERBOARD_RESPONSE } from '@/lib/mockData';

export function LeaderboardList({ title, data, brgy, activeMetric }: { title: string, data: typeof MOCK_LEADERBOARD_RESPONSE, brgy: string, activeMetric: 'allTime' | 'goBag' }) {
    return (
        <div className="flex flex-col w-full">
            <div className="sticky top-0 z-30 w-full bg-base-200/95 backdrop-blur-sm text-center pt-8 pb-6">
                <h3 className="text-gray-500 font-semibold text-lg uppercase tracking-wider mb-2">{title}</h3>
                <h1 className="text-4xl font-extrabold text-text-primary mb-2">Leaderboard</h1>
                <a className="text-sm font-medium text-gray-500">{brgy}</a>
            </div>
            {/* Leaderboard List */}
            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pb-4 px-1 custom-scrollbar">
                {data.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between bg-white px-5 py-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex flex-row items-center gap-4">
                            <span className="text-lg text-gray-400 w-6 text-center">
                                {index + 1}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-[#2a4263]">
                                    {user.name}
                                </span>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-gray-700">
                            {user.points[activeMetric]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}