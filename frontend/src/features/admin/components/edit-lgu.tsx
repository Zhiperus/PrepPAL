import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import {
  LuX,
  LuBuilding,
  LuMail,
  LuSave,
  LuShieldCheck,
  LuShieldAlert,
  LuMapPin,
  LuLoader,
} from 'react-icons/lu';

import { useUpdateLgu } from '../api/edit-lgu';

// --- Types ---
interface LocationItem {
  code: string;
  name: string;
}

interface LGUFormData {
  id: string;
  name: string;
  adminEmail: string;
  status: 'active' | 'inactive';
  region: string;
  province: string;
  city: string;
  barangay: string;
}

type EditLGUModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
};

// --- HELPER: Fuzzy Matcher ---
// Handles "Makati" vs "City of Makati" mismatches
const findMatch = (list: LocationItem[], nameToFind: string) => {
  if (!nameToFind) return undefined;
  const exact = list.find((i) => i.name === nameToFind);
  if (exact) return exact;
  const lower = nameToFind.toLowerCase();
  return list.find(
    (i) =>
      i.name.toLowerCase().includes(lower) ||
      lower.includes(i.name.toLowerCase()),
  );
};

export function EditLGUModal({ isOpen, onClose, tenant }: EditLGUModalProps) {
  const updateLguMutation = useUpdateLgu({
    config: {
      onSuccess: () => {
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
    formState: { isValid },
  } = useForm<LGUFormData>({
    mode: 'onChange',
  });

  const [loadingLocation, setLoadingLocation] = useState(false);

  // Lists
  const [regionList, setRegionList] = useState<LocationItem[]>([]);
  const [provinceList, setProvinceList] = useState<LocationItem[]>([]);
  const [cityList, setCityList] = useState<LocationItem[]>([]);
  const [barangayList, setBarangayList] = useState<LocationItem[]>([]);

  const selectedRegion = watch('region');
  const currentStatus = watch('status');

  // --- 1. ROBUST HYDRATION ---
  useEffect(() => {
    const hydrate = async () => {
      if (!isOpen || !tenant) return;

      setLoadingLocation(true);

      // Temporary variables to hold data before setting state
      let regions: LocationItem[] = [];
      let provinces: LocationItem[] = [];
      let cities: LocationItem[] = [];
      let barangays: LocationItem[] = [];

      // Values to populate form with (normalized to API names)
      let resolvedRegion = tenant.region;
      let resolvedProvince = tenant.province;
      let resolvedCity = tenant.city;
      let resolvedBarangay = tenant.barangay;

      try {
        // A. Regions
        const regRes = await fetch('https://psgc.gitlab.io/api/regions/');
        regions = await regRes.json();
        regions.sort((a, b) => a.name.localeCompare(b.name));
        setRegionList(regions);

        const regionMatch = findMatch(regions, tenant.region);

        if (regionMatch) {
          resolvedRegion = regionMatch.name;

          // B. Provinces / NCR
          const provRes = await fetch(
            `https://psgc.gitlab.io/api/regions/${regionMatch.code}/provinces/`,
          );
          provinces = await provRes.json();
          provinces.sort((a, b) => a.name.localeCompare(b.name));
          setProvinceList(provinces);

          let targetCityCode = '';

          // HANDLE NCR (No Provinces)
          if (provinces.length === 0 && regionMatch.name.includes('NCR')) {
            resolvedProvince = 'Metro Manila'; // Force UI value
            const cityRes = await fetch(
              `https://psgc.gitlab.io/api/regions/${regionMatch.code}/cities-municipalities/`,
            );
            cities = await cityRes.json();
            cities.sort((a, b) => a.name.localeCompare(b.name));
            setCityList(cities);

            const cityMatch = findMatch(cities, tenant.city);
            if (cityMatch) {
              resolvedCity = cityMatch.name;
              targetCityCode = cityMatch.code;
            }
          }
          // HANDLE NORMAL PROVINCES
          else {
            const provinceMatch = findMatch(provinces, tenant.province);
            if (provinceMatch) {
              resolvedProvince = provinceMatch.name;
              const cityRes = await fetch(
                `https://psgc.gitlab.io/api/provinces/${provinceMatch.code}/cities-municipalities/`,
              );
              cities = await cityRes.json();
              cities.sort((a, b) => a.name.localeCompare(b.name));
              setCityList(cities);

              const cityMatch = findMatch(cities, tenant.city);
              if (cityMatch) {
                resolvedCity = cityMatch.name;
                targetCityCode = cityMatch.code;
              }
            }
          }

          // C. Barangays
          if (targetCityCode) {
            const brgyRes = await fetch(
              `https://psgc.gitlab.io/api/cities-municipalities/${targetCityCode}/barangays/`,
            );
            barangays = await brgyRes.json();
            barangays.sort((a, b) => a.name.localeCompare(b.name));
            setBarangayList(barangays);

            const brgyMatch = findMatch(barangays, tenant.barangay);
            if (brgyMatch) resolvedBarangay = brgyMatch.name;
          }
        }

        // Apply Normalized Values
        reset({
          id: tenant.id,
          name: tenant.name,
          adminEmail: tenant.adminEmail,
          status: tenant.status,
          region: resolvedRegion,
          province: resolvedProvince,
          city: resolvedCity,
          barangay: resolvedBarangay,
        });
      } catch (error) {
        console.error('Hydration Failed:', error);
      } finally {
        setLoadingLocation(false);
      }
    };

    hydrate();
  }, [isOpen, tenant, reset]);

  // --- 2. CASCADING HANDLERS (Manual Changes) ---

  const onRegionChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const regionObj = regionList.find((r) => r.name === name);

    setValue('region', name, { shouldDirty: true });
    // Reset children
    setValue('province', '');
    setValue('city', '');
    setValue('barangay', '');
    setProvinceList([]);
    setCityList([]);
    setBarangayList([]);

    if (!regionObj) return;

    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/regions/${regionObj.code}/provinces/`,
      );
      const data: LocationItem[] = await response.json();

      if (data.length === 0) {
        // NCR Case
        const cityRes = await fetch(
          `https://psgc.gitlab.io/api/regions/${regionObj.code}/cities-municipalities/`,
        );
        const cityData: LocationItem[] = await cityRes.json();
        setCityList(cityData.sort((a, b) => a.name.localeCompare(b.name)));
        if (name.includes('NCR')) setValue('province', 'Metro Manila');
      } else {
        setProvinceList(data.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  const onProvinceChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const provObj = provinceList.find((p) => p.name === name);

    setValue('province', name, { shouldDirty: true });
    setValue('city', '');
    setValue('barangay', '');
    setCityList([]);
    setBarangayList([]);

    if (!provObj) return;

    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/provinces/${provObj.code}/cities-municipalities/`,
      );
      const data: LocationItem[] = await response.json();
      setCityList(data.sort((a, b) => a.name.localeCompare(b.name)));
    } finally {
      setLoadingLocation(false);
    }
  };

  const onCityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const cityObj = cityList.find((c) => c.name === name);

    setValue('city', name, { shouldDirty: true });
    setValue('barangay', '');
    setBarangayList([]);

    if (!cityObj) return;

    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${cityObj.code}/barangays/`,
      );
      const data: LocationItem[] = await response.json();
      setBarangayList(data.sort((a, b) => a.name.localeCompare(b.name)));
    } finally {
      setLoadingLocation(false);
    }
  };

  const onSubmit = (formData: LGUFormData) => {
    updateLguMutation.mutate({
      lguId: formData.id,
      data: { ...formData },
    });
  };

  if (!isOpen || !tenant) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 duration-200">
      <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl duration-200">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#2a4263]">
              Edit LGU Details
            </h2>
            <p className="text-xs text-gray-500">
              Update information for {tenant.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:bg-gray-100 hover:text-red-500"
          >
            <LuX size={20} />
          </button>
        </div>

        {/* LOADING STATE - Hides form content to prevent visual jumping */}
        {loadingLocation ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <LuLoader className="h-10 w-10 animate-spin text-[#2a4263]" />
            <p className="text-sm font-medium text-gray-500">
              Loading location data...
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto px-6 py-6">
            <form
              id="edit-lgu-form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Status */}
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  {currentStatus === 'active' ? (
                    <LuShieldCheck className="text-green-500" size={24} />
                  ) : (
                    <LuShieldAlert className="text-amber-500" size={24} />
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-700">
                      Account Status
                    </p>
                    <p className="text-xs text-gray-500">
                      Currently {currentStatus}
                    </p>
                  </div>
                </div>
                <select
                  {...register('status')}
                  className={`select select-sm rounded-lg border-none focus:ring-0 ${currentStatus === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-gray-700">
                    LGU Display Name
                  </span>
                </label>
                <div className="relative">
                  <LuBuilding className="absolute inset-y-0 left-3 my-auto text-gray-400" />
                  <input
                    {...register('name', { required: true })}
                    type="text"
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
                  <span className="label-text text-xs font-bold text-gray-700">
                    Region
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm w-full rounded-xl"
                  {...register('region', { required: true })}
                  onChange={onRegionChange}
                >
                  <option value="" disabled>
                    Select Region
                  </option>
                  {regionList.map((reg) => (
                    <option key={reg.code} value={reg.name}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Province & City */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-gray-700">
                      Province
                    </span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full rounded-xl"
                    {...register('province', { required: true })}
                    onChange={onProvinceChange}
                    disabled={
                      provinceList.length === 0 &&
                      !selectedRegion?.includes('NCR')
                    }
                  >
                    <option value="" disabled>
                      Select Province
                    </option>
                    {provinceList.map((prov) => (
                      <option key={prov.code} value={prov.name}>
                        {prov.name}
                      </option>
                    ))}
                    {selectedRegion?.includes('NCR') && (
                      <option value="Metro Manila">Metro Manila</option>
                    )}
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-xs font-bold text-gray-700">
                      City
                    </span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full rounded-xl"
                    {...register('city', { required: true })}
                    onChange={onCityChange}
                    disabled={cityList.length === 0}
                  >
                    <option value="" disabled>
                      Select City
                    </option>
                    {cityList.map((city) => (
                      <option key={city.code} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Barangay */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-xs font-bold text-gray-700">
                    Barangay
                  </span>
                </label>
                <div className="relative">
                  <LuMapPin className="absolute inset-y-0 left-3 z-10 my-auto text-gray-400" />
                  <select
                    className="select select-bordered select-sm w-full rounded-xl pl-10"
                    {...register('barangay', { required: true })}
                    disabled={barangayList.length === 0}
                  >
                    <option value="" disabled>
                      Select Barangay
                    </option>
                    {barangayList.map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin Email */}
              <div className="form-control mt-2 w-full">
                <label className="label">
                  <span className="label-text font-bold text-gray-700">
                    Admin Email
                  </span>
                </label>
                <div className="relative">
                  <LuMail className="absolute inset-y-0 left-3 my-auto text-gray-400" />
                  <input
                    {...register('adminEmail')}
                    type="email"
                    disabled
                    className="input input-bordered w-full cursor-not-allowed rounded-xl pl-10 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="modal-action mt-0 flex shrink-0 items-center gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost flex-1 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-lgu-form"
            disabled={
              !isValid || updateLguMutation.isPending || loadingLocation
            }
            className="btn flex-1 gap-2 rounded-xl border-none bg-[#2a4263] text-white hover:bg-[#1e3a5a] disabled:bg-gray-300"
          >
            {updateLguMutation.isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <LuSave size={18} />
            )}
            {updateLguMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
