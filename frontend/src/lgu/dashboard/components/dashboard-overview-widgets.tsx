import { LuFlag, LuUsersRound, LuNotebookPen } from 'react-icons/lu';

import { useDashboardStats } from '../api/get-stats';

export default function DashboardSummarySection() {
  const { data, isFetching } = useDashboardStats();

  if (isFetching) {
    return (
      <div className="w-full p-6 flex justify-center items-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-text-primary"></span>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-bg-primary min-h-screen">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4">
          
          {/* Pending Reports */}
          <div className="card bg-btn-primary shadow-md border border-base-content/10 relative overflow-hidden">
            <div className="card-body p-6">
              <h2 className="card-title text-xs font-bold uppercase text-white tracking-widest">
                Pending Reports
              </h2>
              <LuFlag 
                className="absolute bottom-0.5 right-2 text-white/20 text-9xl rotate-[-25deg] pointer-events-none" 
              />
              <p className="text-4xl font-black text-white my-1">
                {data.pendingReports}
              </p>
              <div className="text-xs font-medium text-white/70">
                Reports requiring review
              </div>
              <div className="card-actions mt-4">
                <button className="btn btn-md bg-btn-secondary btn-outline text-text-primary border-white/30 transition-colors">
                  Review Reports
                </button>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="card bg-btn-primary shadow-md border border-base-content/10 relative overflow-hidden">
            <div className="card-body p-6">
              <h2 className="card-title text-xs font-bold uppercase text-white tracking-widest">
                Total Users
              </h2>
              <LuUsersRound 
                className="absolute -bottom-5 right-2 text-white/20 text-9xl pointer-events-none" 
              />
              <p className="text-4xl font-black text-white my-1">
                {data.totalUsers.toLocaleString()}
              </p>
              <div className="text-xs font-medium text-white/70">
                Registered Users
              </div>
            </div>
          </div>

          {/* Module Completion */}
          <div className="card bg-btn-primary shadow-md border border-base-content/10 relative overflow-hidden">
            <div className="card-body p-6">
              <h2 className="card-title text-xs font-bold uppercase text-white tracking-widest">
                Module Completion
              </h2>
              <LuNotebookPen 
                className="absolute bottom-2 right-2 text-white/20 text-9xl rotate-[-15deg] pointer-events-none" 
              />
              <p className="text-4xl font-black text-white my-1">
                {data.avgCompletion}%
              </p>
              <div className="text-xs font-medium text-white/70">
                Average module completion rate
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}