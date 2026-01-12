import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { LuX, LuBuilding, LuMail, LuUserPlus, LuLock } from 'react-icons/lu';

import { useCreateLgu } from '../api/add-lgu';

// --- Types ---
interface LocationItem {
  code: string;
  name: string;
}

interface LGUFormData {
  lguName: string;
  adminEmail: string;
  password: string; // Required for the account creation
  location: {
    region: string;
    province: string;
    city: string;
    barangay: string;
  };
}

type AddLGUModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddLGUModal({ isOpen, onClose }: AddLGUModalProps) {
  // 1. Initialize the mutation hook
  const createLguMutation = useCreateLgu({
    config: {
      onSuccess: () => {
        reset();
        onClose();
      },
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isValid, errors },
  } = useForm<LGUFormData>({
    mode: 'onChange',
  });

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [regionList, setRegionList] = useState<LocationItem[]>([]);
  const [provinceList, setProvinceList] = useState<LocationItem[]>([]);
  const [cityList, setCityList] = useState<LocationItem[]>([]);
  const [barangayList, setBarangayList] = useState<LocationItem[]>([]);

  const selectedRegion = watch('location.region');
  const selectedProvince = watch('location.province');
  const selectedCity = watch('location.city');

  useEffect(() => {
    if (isOpen) {
      const fetchRegions = async () => {
        try {
          const response = await fetch('https://psgc.gitlab.io/api/regions/');
          const data: LocationItem[] = await response.json();
          setRegionList(data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
          console.error('Error fetching regions:', error);
        }
      };
      fetchRegions();
    }
  }, [isOpen]);

  // --- Location Handlers ---
  const onRegionChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const regionObj = regionList.find((r) => r.code === code);

    setValue('location.region', regionObj?.name || '');
    setValue('location.province', '');
    setValue('location.city', '');
    setValue('location.barangay', '');
    setProvinceList([]);
    setCityList([]);
    setBarangayList([]);

    if (!code) return;

    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/regions/${code}/provinces/`,
      );
      const data: LocationItem[] = await response.json();

      if (data.length === 0) {
        const cityRes = await fetch(
          `https://psgc.gitlab.io/api/regions/${code}/cities-municipalities/`,
        );
        const cityData: LocationItem[] = await cityRes.json();
        setCityList(cityData.sort((a, b) => a.name.localeCompare(b.name)));

        if (regionObj?.name.includes('NCR')) {
          setValue('location.province', 'Metro Manila');
        }
      } else {
        setProvinceList(data.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  const onProvinceChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const provObj = provinceList.find((p) => p.code === code);

    setValue('location.province', provObj?.name || '');
    setValue('location.city', '');
    setValue('location.barangay', '');
    setCityList([]);
    setBarangayList([]);

    if (!code) return;

    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/provinces/${code}/cities-municipalities/`,
      );
      const data: LocationItem[] = await response.json();
      setCityList(data.sort((a, b) => a.name.localeCompare(b.name)));
    } finally {
      setLoadingLocation(false);
    }
  };

  const onCityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const cityObj = cityList.find((c) => c.code === code);

    setValue('location.city', cityObj?.name || '');
    setValue('location.barangay', '');
    setBarangayList([]);

    if (!code) return;

    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${code}/barangays/`,
      );
      const data: LocationItem[] = await response.json();
      setBarangayList(data.sort((a, b) => a.name.localeCompare(b.name)));
    } finally {
      setLoadingLocation(false);
    }
  };

  // 2. Updated Submit Handler
  const onSubmit = (formData: LGUFormData) => {
    createLguMutation.mutate({
      name: formData.lguName,
      adminEmail: formData.adminEmail,
      password: formData.password,
      region: formData.location.region,
      province: formData.location.province,
      city: formData.location.city,
      barangay: formData.location.barangay,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 duration-200">
      <div className="animate-in zoom-in-95 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl duration-200">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#2a4263]">
              Add LGU Account
            </h2>
            <p className="text-xs text-gray-500">
              Add a new barangay admin user.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:bg-gray-100 hover:text-red-500"
          >
            <LuX size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6">
          <form
            id="add-lgu-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* LGU Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-gray-700">
                  LGU Display Name
                </span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <LuBuilding />
                </div>
                <input
                  {...register('lguName', { required: true })}
                  type="text"
                  placeholder="e.g. Brgy. Batong Malake"
                  className="input input-bordered w-full rounded-xl pl-10 focus:border-[#2a4263] focus:outline-none"
                />
              </div>
            </div>

            <div className="divider text-xs font-bold text-gray-400">
              LOCATION DETAILS
            </div>

            {/* Region */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-gray-700">
                  Region
                </span>
              </label>
              <select
                className="select select-bordered w-full rounded-xl focus:border-[#2a4263] focus:outline-none"
                onChange={onRegionChange}
                value={
                  regionList.find((r) => r.name === selectedRegion)?.code || ''
                }
              >
                <option value="" disabled>
                  Select Region
                </option>
                {regionList.map((reg) => (
                  <option key={reg.code} value={reg.code}>
                    {reg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-gray-700">
                  Province
                </span>
              </label>
              <select
                className="select select-bordered w-full rounded-xl focus:border-[#2a4263] focus:outline-none"
                onChange={onProvinceChange}
                value={
                  provinceList.find((p) => p.name === selectedProvince)?.code ||
                  ''
                }
                disabled={!selectedRegion}
              >
                <option value="" disabled>
                  {provinceList.length === 0 && selectedRegion?.includes('NCR')
                    ? 'Metro Manila (Auto)'
                    : 'Select Province'}
                </option>
                {provinceList.map((prov) => (
                  <option key={prov.code} value={prov.code}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-gray-700">
                  City / Municipality
                </span>
              </label>
              <select
                className="select select-bordered w-full rounded-xl focus:border-[#2a4263] focus:outline-none"
                onChange={onCityChange}
                value={
                  cityList.find((c) => c.name === selectedCity)?.code || ''
                }
                disabled={cityList.length === 0}
              >
                <option value="" disabled>
                  {loadingLocation ? 'Loading...' : 'Select City'}
                </option>
                {cityList.map((city) => (
                  <option key={city.code} value={city.code}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Barangay */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-gray-700">
                  Barangay
                </span>
              </label>
              <select
                className="select select-bordered w-full rounded-xl focus:border-[#2a4263] focus:outline-none"
                {...register('location.barangay', { required: true })}
                defaultValue=""
                disabled={barangayList.length === 0}
              >
                <option value="" disabled>
                  {loadingLocation ? 'Loading...' : 'Select Barangay'}
                </option>
                {barangayList.map((brgy) => (
                  <option key={brgy.code} value={brgy.name}>
                    {brgy.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="divider text-xs font-bold text-gray-400">
              ADMIN ACCOUNT
            </div>

            {/* Admin Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-gray-700">
                  Admin Email
                </span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <LuMail />
                </div>
                <input
                  {...register('adminEmail', { required: true })}
                  type="email"
                  placeholder="admin@barangay.gov.ph"
                  className="input input-bordered w-full rounded-xl pl-10 focus:border-[#2a4263] focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field (ADDED) */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-gray-700">
                  Password
                </span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <LuLock />
                </div>
                <input
                  {...register('password', {
                    required: true,
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  type="text"
                  className={`input input-bordered w-full rounded-xl pl-10 focus:outline-none ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500'
                      : 'focus:border-[#2a4263]'
                  }`}
                />
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-red-500">
                    {errors.password.message || 'Password is required'}
                  </span>
                </label>
              )}
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="modal-action mt-0 flex shrink-0 items-center gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={createLguMutation.isPending}
            className="btn btn-ghost flex-1 rounded-xl hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-lgu-form"
            // Disable button if form is invalid, location is loading, or request is pending
            disabled={
              !isValid || loadingLocation || createLguMutation.isPending
            }
            className="btn flex-1 gap-2 rounded-xl border-none bg-[#2a4263] text-white hover:bg-[#1e3a5a] disabled:bg-gray-300"
          >
            {createLguMutation.isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <LuUserPlus size={18} />
            )}
            {createLguMutation.isPending ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
