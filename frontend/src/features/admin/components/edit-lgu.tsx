import {
  LuX,
  LuBuilding,
  LuMail,
  LuShieldCheck,
  LuShieldAlert,
  LuMapPin,
} from 'react-icons/lu';

type ViewLGUModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenant: any;
};

export function ViewLGUModal({ isOpen, onClose, tenant }: ViewLGUModalProps) {
  if (!isOpen || !tenant) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 duration-200">
      <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl duration-200">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#2a4263]">LGU Details</h2>
            <p className="text-xs text-gray-500">
              View information for {tenant.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:bg-gray-100 hover:text-red-500"
          >
            <LuX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-5">
            {/* Status Card */}
            <div
              className={`flex items-center gap-4 rounded-xl border p-4 ${tenant.status === 'active' ? 'border-green-100 bg-green-50' : 'border-amber-100 bg-amber-50'}`}
            >
              {tenant.status === 'active' ? (
                <div className="rounded-full bg-green-100 p-2 text-green-600">
                  <LuShieldCheck size={24} />
                </div>
              ) : (
                <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                  <LuShieldAlert size={24} />
                </div>
              )}
              <div>
                <p className="text-sm font-bold tracking-wide text-gray-800 uppercase">
                  Account Status
                </p>
                <p
                  className={`text-sm font-medium ${tenant.status === 'active' ? 'text-green-700' : 'text-amber-700'}`}
                >
                  {tenant.status === 'active'
                    ? 'Active & Operational'
                    : 'Inactive / Suspended'}
                </p>
              </div>
            </div>

            {/* Basic Info Group */}
            <div className="space-y-4">
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text text-xs font-bold tracking-wider text-gray-400 uppercase">
                    LGU Name
                  </span>
                </label>
                <div className="relative flex items-center">
                  <LuBuilding className="absolute left-3 text-gray-400" />
                  <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pl-10 text-sm font-medium text-gray-700">
                    {tenant.name}
                  </div>
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Admin Email
                  </span>
                </label>
                <div className="relative flex items-center">
                  <LuMail className="absolute left-3 text-gray-400" />
                  <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 pl-10 text-sm font-medium text-gray-700">
                    {tenant.adminEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details Group */}
            <div>
              <div className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                <LuMapPin className="text-[#2a4263]" size={16} />
                <span className="text-xs font-bold tracking-wider text-[#2a4263] uppercase">
                  Jurisdiction Details
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">
                    Region
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {tenant.region}
                  </span>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">
                    Province
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {tenant.province}
                  </span>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">
                    City
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {tenant.city}
                  </span>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">
                    Barangay
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {tenant.barangay || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-action mt-0 rounded-b-2xl border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="btn w-full rounded-xl border-none bg-[#2a4263] text-white hover:bg-[#1e3a5a]"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
