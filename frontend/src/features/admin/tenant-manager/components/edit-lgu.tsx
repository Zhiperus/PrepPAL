import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { LuX, LuBuilding, LuMail, LuSave, LuMapPin } from "react-icons/lu";

import { useUpdateLgu } from "../api/edit-lgu";

// --- Types ---
interface LocationItem {
    code: string;
    name: string;
}

interface LGUFormData {
    id: string;
    name: string; // LGU Name
    adminEmail: string;
    status: 'active' | 'inactive';
    region: string;
    province: string;
    city: string;
    barangay?: string;
}

type EditLGUModalProps = {
    isOpen: boolean;
    onClose: () => void;
    tenant: any;
};

export function EditLGUModal({ isOpen, onClose, tenant }: EditLGUModalProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isValid, isDirty }
    } = useForm<LGUFormData>({
        mode: 'onChange'
    });

    // --- Local State for Dropdowns ---
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [regionList, setRegionList] = useState<LocationItem[]>([]);
    const [provinceList, setProvinceList] = useState<LocationItem[]>([]);
    const [cityList, setCityList] = useState<LocationItem[]>([]);
    const [barangayList, setBarangayList] = useState<LocationItem[]>([]);

    // --- Watch Fields ---
    const selectedRegion = watch('region');
    const selectedProvince = watch('province');
    const selectedCity = watch('city');
    const currentStatus = watch('status');

    // --- 1. Load Data on Open ---
    useEffect(() => {
        if (isOpen && tenant) {
            reset({
                id: tenant.id,
                name: tenant.name,
                adminEmail: tenant.adminEmail,
                status: tenant.status,
                region: tenant.region,
                province: tenant.province,
                city: tenant.city,
                // barangay: tenant.barangay 
            });

            fetchRegions();
        }
    }, [isOpen, tenant, reset]);

    const fetchRegions = async () => {
        try {
            const response = await fetch('https://psgc.gitlab.io/api/regions/');
            const data: LocationItem[] = await response.json();
            setRegionList(data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error('Error fetching regions:', error);
        }
    };

    // --- 2. Handlers (Cascading Logic) ---

    const onRegionChange = async (e: ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const regionObj = regionList.find((r) => r.code === code);

        setValue('region', regionObj?.name || '', { shouldDirty: true });

        // Reset children on change
        setValue('province', '');
        setValue('city', '');
        setValue('barangay', '');
        setProvinceList([]);
        setCityList([]);
        setBarangayList([]);

        if (!code) return;

        setLoadingLocation(true);
        try {
            const response = await fetch(`https://psgc.gitlab.io/api/regions/${code}/provinces/`);
            const data: LocationItem[] = await response.json();

            if (data.length === 0) {
                // NCR Case
                const cityRes = await fetch(`https://psgc.gitlab.io/api/regions/${code}/cities-municipalities/`);
                const cityData: LocationItem[] = await cityRes.json();
                setCityList(cityData.sort((a, b) => a.name.localeCompare(b.name)));

                if (regionObj?.name.includes('NCR')) {
                    setValue('province', 'Metro Manila');
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

        setValue('province', provObj?.name || '', { shouldDirty: true });
        setValue('city', '');
        setValue('barangay', '');
        setCityList([]);
        setBarangayList([]);

        if (!code) return;

        setLoadingLocation(true);
        try {
            const response = await fetch(`https://psgc.gitlab.io/api/provinces/${code}/cities-municipalities/`);
            const data: LocationItem[] = await response.json();
            setCityList(data.sort((a, b) => a.name.localeCompare(b.name)));
        } finally {
            setLoadingLocation(false);
        }
    };

    const onCityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const cityObj = cityList.find((c) => c.code === code);

        setValue('city', cityObj?.name || '', { shouldDirty: true });
        setValue('barangay', '');
        setBarangayList([]);

        if (!code) return;

        setLoadingLocation(true);
        try {
            const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${code}/barangays/`);
            const data: LocationItem[] = await response.json();
            setBarangayList(data.sort((a, b) => a.name.localeCompare(b.name)));
        } finally {
            setLoadingLocation(false);
        }
    };

    const onBarangayChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setValue('barangay', e.target.value, { shouldDirty: true });
    };

    // --- Submit Handler ---
    const onSubmit = (data: LGUFormData) => {
        console.log("Updating LGU:", data);
        useUpdateLgu()
        onClose();
    };

    if (!isOpen || !tenant) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-[#2a4263]">Edit LGU Details</h2>
                        <p className="text-xs text-gray-500">Update information for {tenant.name}</p>
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
                    <form id="edit-lgu-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                        {/* LGU Name */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-gray-700">LGU Display Name</span>
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <LuBuilding />
                                </div>
                                <input
                                    {...register('name', { required: true })}
                                    type="text"
                                    className="input input-bordered w-full pl-10 focus:border-[#2a4263] focus:outline-none rounded-xl"
                                />
                            </div>
                        </div>

                        {/* --- Location Section --- */}
                        <div className="divider text-xs text-gray-400 font-bold">LOCATION DETAILS</div>

                        {/* Region */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-gray-700">Region</span>
                            </label>
                            <select
                                className="select select-bordered w-full focus:border-[#2a4263] focus:outline-none rounded-xl"
                                onChange={onRegionChange}
                                // If the dropdown list has loaded, try to match the name to set the dropdown value
                                value={regionList.find(r => r.name === selectedRegion)?.code || ""}
                            >
                                <option value="" disabled>Select to Change Region</option>
                                {regionList.map((reg) => (
                                    <option key={reg.code} value={reg.code}>{reg.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Province */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-gray-700">Province</span>
                            </label>
                            <select
                                className="select select-bordered w-full focus:border-[#2a4263] focus:outline-none rounded-xl"
                                onChange={onProvinceChange}
                                value={provinceList.find(p => p.name === selectedProvince)?.code || ""}
                                disabled={provinceList.length === 0 && !selectedRegion?.includes('NCR')}
                            >
                                <option value="" disabled>
                                    {provinceList.length === 0 && selectedRegion?.includes('NCR')
                                        ? 'Metro Manila (Auto)'
                                        : 'Select Province'}
                                </option>
                                {provinceList.map((prov) => (
                                    <option key={prov.code} value={prov.code}>{prov.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* City / Municipality */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-gray-700">City / Municipality</span>
                            </label>
                            <select
                                className="select select-bordered w-full focus:border-[#2a4263] focus:outline-none rounded-xl"
                                onChange={onCityChange}
                                value={cityList.find(c => c.name === selectedCity)?.code || ""}
                                disabled={cityList.length === 0}
                            >
                                <option value="" disabled>{loadingLocation ? 'Loading...' : 'Select City'}</option>
                                {cityList.map((city) => (
                                    <option key={city.code} value={city.code}>{city.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Barangay (Optional if your mock data has it) */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-gray-700">Barangay</span>
                            </label>
                            <select
                                className="select select-bordered w-full focus:border-[#2a4263] focus:outline-none rounded-xl"
                                onChange={onBarangayChange}
                                disabled={barangayList.length === 0}
                                defaultValue=""
                            >
                                <option value="" disabled>{loadingLocation ? 'Loading...' : 'Select Barangay'}</option>
                                {barangayList.map((brgy) => (
                                    <option key={brgy.code} value={brgy.name}>{brgy.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* --- Admin Details --- */}
                        <div className="divider text-xs text-gray-400 font-bold">ADMIN ACCOUNT</div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-gray-700">Admin Email</span>
                                <span className="label-text-alt text-gray-400">Read-only</span>
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <LuMail />
                                </div>
                                <input
                                    {...register('adminEmail')}
                                    type="email"
                                    disabled
                                    className="input input-bordered w-full pl-10 rounded-xl disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="modal-action border-t border-gray-100 px-6 py-4 mt-0 flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost hover:bg-gray-100 rounded-xl flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-lgu-form"
                        // Only disable if dirty and invalid. If not dirty, we can technically save (no changes)
                        disabled={!isValid || loadingLocation}
                        className="btn bg-[#2a4263] hover:bg-[#1e3a5a] text-white border-none rounded-xl flex-1 gap-2 disabled:bg-gray-300"
                    >
                        <LuSave size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}