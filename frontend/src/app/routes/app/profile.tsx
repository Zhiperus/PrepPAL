import ProfileHeader from '@/features/users/components/profile-header';
import ProfileTabs from '@/features/users/components/profile-tabs';
import { useUser } from '@/lib/auth';

export default function ProfileRoute() {
  const user = useUser();

  if (!user.data) return null;

  return (
    <div className="bg-bg-page flex h-screen flex-col">
      <ProfileHeader user={user.data} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden px-3 pb-4">
        <div className="border-border-container bg-bg-primary flex h-full flex-col overflow-hidden rounded-[20px] border shadow-sm">
          <ProfileTabs />
        </div>
      </div>
    </div>
  );
}
