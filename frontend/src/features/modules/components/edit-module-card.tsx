import type { ModuleListEntry } from '@repo/shared/dist/schemas/module.schema';
import { clsx } from 'clsx';
import {
  LuBookOpen,
  LuEye,
  LuEyeClosed,
  LuTrash,
  LuTrash2,
  LuPencil,
  LuPencilLine,
} from 'react-icons/lu';
import { useNavigate } from 'react-router';

interface ModuleCardProps {
  module: ModuleListEntry;
  onEdit: () => void;
}

export function EditModuleCard({ module, onEdit }: EditModuleCardProps) {
  const navigate = useNavigate();

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div>
        {/* Logo Section */}
        <div className="flex justify-between">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl text-[#2a4263] transition-colors">
            {module.logo || <LuBookOpen />}
          </div>
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-[#2a4263]">
          {module.title}
        </h3>

        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
          {module.description}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-3">
        <button className="btn group/button flex items-center gap-2 rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200">
          {/* Show LuEyeClosed by default, hide it when the group is hovered */}
          <LuEyeClosed className="block group-hover/button:hidden" />
          {/* Hide LuEye by default, show it only when the group is hovered */}
          <LuEye className="hidden group-hover/button:block" />
          <span>View</span>
        </button>

        <button
          onClick={onEdit}
          className="btn btn-wide group/button flex items-center gap-2 rounded-lg bg-gray-100 p-2 transition-colors hover:!bg-[#2a4263] hover:!text-white"
        >
          {/* Show LuEyeClosed by default, hide it when the group is hovered */}
          <LuPencil className="block group-hover/button:hidden" />
          {/* Hide LuEye by default, show it only when the group is hovered */}
          <LuPencilLine className="hidden group-hover/button:block" />
          <span>Edit Module</span>
        </button>
      </div>
    </div>
  );
}
