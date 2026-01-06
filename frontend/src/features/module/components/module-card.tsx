import type { ModuleListEntry } from '@repo/shared/dist/schemas/module.schema';
import { LuBookOpen, LuDumbbell, LuClock } from 'react-icons/lu';
import { useNavigate } from 'react-router';

interface ModuleCardProps {
  module: ModuleListEntry;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const navigate = useNavigate();

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl text-[#2a4263]">
          {module.logo || <LuBookOpen />}
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-[#2a4263]">
          {module.title}
        </h3>

        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
          {module.description}
        </p>

        <div className="mb-6 flex items-center gap-4 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1">
            <LuClock className="h-3.5 w-3.5" />
            <span>{module.readingTime} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <LuDumbbell className="h-3.5 w-3.5" />
            <span>Quiz available</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/app/modules/${module._id}`)}
          className="flex-1 rounded-lg bg-[#2a4263] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e3048]"
        >
          Read
        </button>
        <button
          onClick={() => navigate(`/app/modules/${module._id}/quiz`)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#2a4263]"
        >
          Quiz
        </button>
      </div>
    </div>
  );
}
