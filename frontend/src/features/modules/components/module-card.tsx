import type { Module } from '@repo/shared/dist/schemas/module.schema';
import { clsx } from 'clsx';
import {
  LuBookOpen,
  LuDumbbell,
  LuCircleCheck,
  LuCircleAlert,
} from 'react-icons/lu';
import { useNavigate } from 'react-router';

interface ModuleCardProps {
  module: Module & { userScore?: number | null };
}

export function ModuleCard({ module }: ModuleCardProps) {
  const navigate = useNavigate();

  const hasAttempted =
    module.userScore !== null && module.userScore !== undefined;

  const isPerfect = module.userScore === 100;

  const renderStatus = () => {
    if (!hasAttempted) {
      return (
        <div className="flex items-center gap-1 text-gray-500">
          <LuDumbbell className="h-3.5 w-3.5" />
          <span>Quiz available</span>
        </div>
      );
    }

    if (isPerfect) {
      return (
        <div className="flex items-center gap-1 font-bold text-green-600">
          <LuCircleCheck className="h-3.5 w-3.5" />
          <span>Completed (100%)</span>
        </div>
      );
    }

    // Attempted but not perfect
    return (
      <div className="flex items-center gap-1 font-bold text-orange-600">
        <LuCircleAlert className="h-3.5 w-3.5" />
        <span>Score: {module.userScore}%</span>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'group relative flex flex-col justify-between rounded-xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md',
        isPerfect
          ? 'border-green-200 bg-green-50/20'
          : 'border-gray-200 bg-white',
      )}
    >
      <div>
        {/* Logo Section */}
        <div
          className={clsx(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-2xl transition-colors',
            isPerfect
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-50 text-[#2a4263]',
          )}
        >
          {module.logo || <LuBookOpen />}
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-[#2a4263]">
          {module.title}
        </h3>

        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
          {module.description}
        </p>

        <div className="mb-6 flex items-center gap-4 text-xs font-medium">
          {renderStatus()}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/app/modules/${module._id}`)}
          className="flex-1 rounded-lg bg-[#2a4263] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e3048]"
        >
          Read
        </button>

        <button
          onClick={() => navigate(`/app/modules/${module._id}/quiz`)}
          className={clsx(
            'rounded-lg border px-4 py-2 text-sm font-semibold transition-colors',
            isPerfect
              ? 'border-green-200 text-green-700 hover:bg-green-100'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#2a4263]',
          )}
        >
          {!hasAttempted ? 'Take Quiz' : isPerfect ? 'Review' : 'Retake'}
        </button>
      </div>
    </div>
  );
}
