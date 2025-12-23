import type { OnboardingRequest } from '@repo/shared/dist/schemas/user.schema';
import { useState, useEffect, type ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';

interface LocationItem {
  code: string;
  name: string;
}

interface StepLocationProps {
  onNext: () => void;
}

export function StepLocation({ onNext }: StepLocationProps) {
  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext<OnboardingRequest>();

  const [loadingLocation, setLoadingLocation] = useState(false);

  // Local state for dropdown options
  const [regionList, setRegionList] = useState<LocationItem[]>([]);
  const [provinceList, setProvinceList] = useState<LocationItem[]>([]);
  const [cityList, setCityList] = useState<LocationItem[]>([]);
  const [barangayList, setBarangayList] = useState<LocationItem[]>([]);

  // Watch fields to handle conditional disabling and value matching
  const selectedRegion = watch('location.region');
  const selectedProvince = watch('location.province');
  const selectedCity = watch('location.city');
  const selectedBarangay = watch('location.barangay');

  // --- 1. INITIAL FETCH & HYDRATION EFFECTS ---

  // Fetch Regions on mount
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (selectedRegion && regionList.length > 0 && provinceList.length === 0) {
      const regionCode = regionList.find(
        (r) => r.name === selectedRegion,
      )?.code;
      if (!regionCode) return;

      setLoadingLocation(true);
      fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`)
        .then((res) => res.json())
        .then((data: LocationItem[]) => {
          if (data.length === 0) {
            // NCR Case
            fetch(
              `https://psgc.gitlab.io/api/regions/${regionCode}/cities-municipalities/`,
            )
              .then((res) => res.json())
              .then((cityData) =>
                setCityList(
                  cityData.sort((a: any, b: any) =>
                    a.name.localeCompare(b.name),
                  ),
                ),
              );
          } else {
            setProvinceList(data.sort((a, b) => a.name.localeCompare(b.name)));
          }
        })
        .finally(() => setLoadingLocation(false));
    }
  }, [selectedRegion, regionList, provinceList.length]);

  useEffect(() => {
    if (selectedProvince && provinceList.length > 0 && cityList.length === 0) {
      const provinceCode = provinceList.find(
        (p) => p.name === selectedProvince,
      )?.code;
      if (!provinceCode) return;

      setLoadingLocation(true);
      fetch(
        `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`,
      )
        .then((res) => res.json())
        .then((data) =>
          setCityList(
            data.sort((a: any, b: any) => a.name.localeCompare(b.name)),
          ),
        )
        .finally(() => setLoadingLocation(false));
    }
  }, [selectedProvince, provinceList, cityList.length]);

  useEffect(() => {
    if (selectedCity && cityList.length > 0 && barangayList.length === 0) {
      const cityCode = cityList.find((c) => c.name === selectedCity)?.code;
      if (!cityCode) return;

      setLoadingLocation(true);
      fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`,
      )
        .then((res) => res.json())
        .then((data) =>
          setBarangayList(
            data.sort((a: any, b: any) => a.name.localeCompare(b.name)),
          ),
        )
        .finally(() => setLoadingLocation(false));
    }
  }, [selectedCity, cityList, barangayList.length]);

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
        // NCR Case
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

  const handleNext = async () => {
    // Only validate the location fields before proceeding
    const isPageValid = await trigger(['location']);
    if (isPageValid) {
      onNext();
    }
  };

  return (
    <div className="mt-8 flex w-full flex-col">
      <h2 className="mb-6 text-2xl font-bold text-[#1f2937]">Location</h2>

      {/* Region */}
      <fieldset className="fieldset form-control mb-4 w-full">
        <legend className="fieldset-legend text-base font-semibold text-gray-700">
          Region
        </legend>
        <select
          className={`select select-bordered w-full border-[#2a4263] bg-white ${errors.location?.region ? 'select-error' : ''}`}
          onChange={onRegionChange}
          // Reverse Lookup: Find Code based on Saved Name
          value={regionList.find((r) => r.name === selectedRegion)?.code || ''}
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
        {errors.location?.region && (
          <span className="text-error mt-1 text-sm">
            {errors.location.region.message}
          </span>
        )}
      </fieldset>

      {/* Province */}
      <fieldset className="fieldset form-control mb-4 w-full">
        <legend className="fieldset-legend text-base font-semibold text-gray-700">
          Province
        </legend>
        <select
          className="select select-bordered w-full border-[#2a4263] bg-white"
          onChange={onProvinceChange}
          value={
            provinceList.find((p) => p.name === selectedProvince)?.code || ''
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
        {errors.location?.province && (
          <span className="text-error mt-1 text-sm">
            {errors.location.province.message}
          </span>
        )}
      </fieldset>

      {/* City */}
      <fieldset className="fieldset form-control mb-4 w-full">
        <legend className="fieldset-legend text-base font-semibold text-gray-700">
          City / Municipality
        </legend>
        <select
          className="select select-bordered w-full border-[#2a4263] bg-white"
          onChange={onCityChange}
          value={cityList.find((c) => c.name === selectedCity)?.code || ''}
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
        {errors.location?.city && (
          <span className="text-error mt-1 text-sm">
            {errors.location.city.message}
          </span>
        )}
      </fieldset>

      {/* Barangay */}
      <fieldset className="fieldset form-control mb-4 w-full">
        <legend className="fieldset-legend text-base font-semibold text-gray-700">
          Barangay
        </legend>
        <select
          className="select select-bordered w-full border-[#2a4263] bg-white"
          {...register('location.barangay')}
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
        {errors.location?.barangay && (
          <span className="text-error mt-1 text-sm">
            {errors.location.barangay.message}
          </span>
        )}
      </fieldset>

      <button
        type="button"
        className="btn btn-soft btn-primary-custom mt-4 w-full rounded text-lg lg:w-auto"
        disabled={
          !selectedRegion ||
          (!selectedProvince && !selectedRegion?.includes('NCR')) ||
          !selectedCity ||
          !selectedBarangay
        }
        onClick={handleNext}
      >
        Next
      </button>
    </div>
  );
}
