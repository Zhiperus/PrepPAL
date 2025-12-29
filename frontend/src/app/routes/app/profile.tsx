import { useState } from 'react';
import { Check } from 'lucide-react';

const ProfileRoute = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'household'>(
    'personal',
  );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-y-scroll bg-[#F3F4F6] p-4">
      {/* UPDATE: Replaced manual animation with daisyUI 'skeleton' class */}
      <div className="skeleton mb-4 h-[150px] w-[150px] shrink-0 rounded-full shadow-sm"></div>

      <div className="flex h-[640px] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-sm">
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

        <div className="flex-1 p-5 pb-6">
          {activeTab === 'personal' && (
            <form className="flex h-full flex-col space-y-2">
              <div className="space-y-1">
                <label className="block text-base font-bold text-[#4B5563]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter Input"
                  className="w-full rounded-lg border border-[#9CA3AF] px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#2A4263] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-base font-bold text-[#4B5563]">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter Input"
                  className="w-full rounded-lg border border-[#9CA3AF] px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#2A4263] focus:outline-none"
                />
              </div>

              <div className="mt-2 flex items-center gap-6">
                <span className="mr-4 text-base font-bold text-[#4B5563]">
                  Reminders?
                </span>

                <label className="group flex cursor-pointer items-center gap-2 select-none">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition-all group-hover:border-gray-400 peer-checked:border-[#10B981] peer-checked:bg-[#10B981] peer-checked:[&_svg]:opacity-100">
                    <Check
                      size={16}
                      className="text-white opacity-0 transition-opacity"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-[12.34px] font-medium text-[#2A4263] transition-colors group-hover:text-[#15253C] peer-checked:text-[#10B981]">
                    Via Email
                  </span>
                </label>

                <label className="group flex cursor-pointer items-center gap-2 select-none">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition-all group-hover:border-gray-400 peer-checked:border-[#10B981] peer-checked:bg-[#10B981] peer-checked:[&_svg]:opacity-100">
                    <Check
                      size={16}
                      className="text-white opacity-0 transition-opacity"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-[12.34px] font-medium text-[#2A4263] transition-colors group-hover:text-[#15253C] peer-checked:text-[#10B981]">
                    Via SMS
                  </span>
                </label>
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  className="flex-1 rounded-lg border-2 border-[#0891B2] bg-white py-3 text-2xl font-bold text-[#0891B2] transition-colors hover:bg-[#ECFEFF]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="flex-1 rounded-lg bg-[#2A4263] py-3 text-2xl font-bold text-white shadow-sm transition-colors hover:bg-[#3E8DAB]"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {activeTab === 'household' && (
            <form className="flex h-full flex-col space-y-2">
              <div className="space-y-1">
                <label className="block text-base font-bold text-[#4B5563]">
                  Household Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Input"
                  className="w-full rounded-lg border border-[#9CA3AF] px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#2A4263] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-base font-bold text-[#4B5563]">
                  Number of Household Members
                </label>
                <input
                  type="number"
                  placeholder="Enter Input"
                  className="w-full rounded-lg border border-[#9CA3AF] px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#2A4263] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-base font-bold text-[#4B5563]">
                  Number of Female Members (if any)
                </label>
                <input
                  type="number"
                  placeholder="Enter Input"
                  className="w-full rounded-lg border border-[#9CA3AF] px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#2A4263] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-base font-bold text-[#4B5563]">
                  Number of Dogs (if any)
                </label>
                <input
                  type="number"
                  placeholder="Enter Input"
                  className="w-full rounded-lg border border-[#9CA3AF] px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#2A4263] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-base font-bold text-[#4B5563]">
                  Number of Cats (if any)
                </label>
                <input
                  type="number"
                  placeholder="Enter Input"
                  className="w-full rounded-lg border border-[#9CA3AF] px-4 py-2.5 text-base font-medium text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#2A4263] focus:outline-none"
                />
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  className="flex-1 rounded-lg border-2 border-[#0891B2] bg-white py-3 text-2xl font-bold text-[#0891B2] transition-colors hover:bg-[#ECFEFF]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-[#2A4263] py-3 text-2xl font-bold text-white shadow-sm transition-colors hover:bg-[#3E8DAB]"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileRoute;
