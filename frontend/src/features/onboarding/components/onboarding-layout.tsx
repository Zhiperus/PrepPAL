import type { ReactNode } from 'react';

import goBag from '@/assets/school-bag.png';

export function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-base-200 relative flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="hidden w-1/3 flex-col items-center justify-center bg-gray-300 p-4 lg:flex lg:min-h-screen">
        <div className="card bg-base-100 bg-secondary-container w-full max-w-sm shadow-2xl">
          <figure className="flex h-64 items-center justify-center px-10 pt-10">
            <img
              src={goBag}
              alt="Go Bag"
              className="h-48 w-full object-contain"
            />
          </figure>
          <div className="card-body items-center p-6 text-center">
            <h2 className="card-title text-[#2a4263]">Track your Go Bag</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-col items-start justify-center bg-[#F3F4F6] p-8 lg:min-h-screen lg:w-2/3">
        <div className="flex w-full flex-col items-start">
          <h1 className="text-3xl font-extrabold text-[#1f2937] lg:text-5xl">
            Help us get to know you better.
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
