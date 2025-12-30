import type { User } from '@repo/shared/dist/schemas/user.schema';

type ProfileHeaderProps = {
  user: User & { rank?: number };
};

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center px-6 pt-6 pb-2">
      <div className="relative mb-2 flex flex-col items-center">
        <div className="avatar">
          <div className="border-border-container mb-0 h-[140px] w-[140px] rounded-full border-[6px] shadow-sm">
            <img
              src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.email}`}
              alt="Profile"
            />
          </div>
        </div>

        <div className="relative z-10 -mt-4 flex flex-col items-center">
          <div className="bg-btn-primary min-w-[60px] rounded-full px-4 py-0.5 text-center text-[11px] font-bold text-white shadow-md">
            #{user.rank ?? ''}
          </div>
          <span className="text-text-secondary mt-0.5 text-[12px] font-bold tracking-wide">
            Rank
          </span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-text-primary text-[24px] font-extrabold tracking-tight">
          {user.householdName || 'Household Name'}
        </h1>
        <button className="btn btn-sm bg-btn-primary hover:bg-btn-primary-hover h-[28px] min-h-0 rounded-[8px] border-none px-4 text-[13px] font-bold text-white">
          Edit
        </button>
      </div>
    </div>
  );
}
