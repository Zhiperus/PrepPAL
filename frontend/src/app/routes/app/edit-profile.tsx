import { useState } from 'react';

import HouseholdForm from '@/features/users/components/household-form';
import PersonalForm from '@/features/users/components/personal-form';
import { useUser } from '@/lib/auth';

export default function ProfileRoute() {
  const { data: user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<'personal' | 'household'>(
    'personal',
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F3F4F6] p-4">
        <div className="skeleton mb-4 h-[150px] w-[150px] shrink-0 rounded-full shadow-sm"></div>
        <div className="skeleton h-[640px] w-full max-w-3xl rounded-xl"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-y-scroll bg-[#F3F4F6] p-4">
      <div className="avatar placeholder mb-4">
        <div className="bg-neutral text-neutral-content w-32 rounded-full shadow-sm">
          <span className="text-4xl font-bold">
            {user.householdName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      </div>

      <div className="flex h-[640px] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-sm">
        {/* Tab Header */}
        <div className="shrink-0 bg-[#2A4263] p-3">
          <div className="flex rounded-full bg-[#2A4263] p-1">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 rounded-full py-1.5 text-center text-2xl font-bold transition-all ${
                activeTab === 'personal'
                  ? 'bg-white text-[#2A4263]'
                  : 'text-white hover:text-gray-200'
              }`}
            >
              Personal
            </button>

            <button
              onClick={() => setActiveTab('household')}
              className={`flex-1 rounded-full py-1.5 text-center text-2xl font-bold transition-all ${
                activeTab === 'household'
                  ? 'bg-white text-[#2A4263]'
                  : 'text-white hover:text-gray-200'
              }`}
            >
              Household
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-5 pb-6">
          {activeTab === 'personal' && <PersonalForm user={user} />}
          {activeTab === 'household' && <HouseholdForm user={user} />}
        </div>
      </div>
    </div>
  );
}
