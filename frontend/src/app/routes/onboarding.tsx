import { useState } from 'react';
import { useNavigate } from 'react-router';

import { paths } from '@/config/paths';


import PhilippinesData from "phil-reg-prov-mun-brgy";
const { regions, provinces, city_mun, barangays } = PhilippinesData;
export default function Onboarding() {
  const goTo = useNavigate();
  const [page, setPage] = useState(1);

  // Data structure for user input for onboarding
  const [userInfo, setUserInfo] = useState({
    region: "",
    province: "",
    city: "",
    barangay: "",
    householdName: "",
    memberCount: "",
    femaleCount: "",
    dogCount: "",
    catCount: "",
    emailConsent: false,
  });

  const [filteredProvinces, setFilteredProvinces] = useState<any[]>([]);  
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [filteredBarangays, setFilteredBarangays] = useState<any[]>([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setUserInfo((prev) => ({ ...prev, [name]: value }));

    if (name === "region") {
      const myProvinces = provinces.filter(p => p.reg_code === value);
            
      setFilteredProvinces(myProvinces);
      setFilteredCities([]);
      setFilteredBarangays([]);
      
      setUserInfo(prev => ({ 
        ...prev, 
        region: value, // Or use regionName if you prefer saving names
        province: "", 
        city: "", 
        barangay: "" 
      }));
    }

    if (name === "province") {
      const myCities = city_mun.filter(c => c.prov_code === value);
      
      setFilteredCities(myCities);
      setFilteredBarangays([]);
      setUserInfo(prev => ({ ...prev, province: value, city: "", barangay: "" }));
    }

    if (name === "city") {
      const myBarangays = barangays.filter(b => b.mun_code === value);
      
      setFilteredBarangays(myBarangays);
      setUserInfo(prev => ({ ...prev, city: value, barangay: "" }));
    }
  };

  // Navigation for Onboarding
  const handleNext = () => setPage(page+1);
  const handleBack = () => setPage(page-1);

  const handleSubmit = () => {
    console.log("Submitting:", userInfo);
    // add API call here
    goTo("/home"); 
  };

  return (
    <div className="flex min-h-screen flex-row bg-base-200">
      <div className="flex w-1/3 flex-col items-center justify-center bg-gray-300 p-4">
      </div>

      <div className="flex w-2/3 flex-col items-left justify-center bg-[#F3F4F6] p-8">
        
        <div className='flex flex-col items-end'>
          <h1 className="text-5xl font-extrabold text-[#1f2937]">
            Help us get to know you better.
          </h1>
          <p className="mt-2 text-xl text-gray-500">
            These information will be used to make your experience more personalized.
          </p>
        </div>

        {page === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-[#1f2937]">Location</h2>

          {/* Region Selector */}
          {/* REGION */}
          <div className="form-control w-full mb-4">
            <label className="label font-semibold text-gray-700">Region</label>
            <select
              name="region"
              value={userInfo.region}
              onChange={handleChange}
              className={`select select-bordered border-[#2a4263] w-full bg-white font-normal ${
                    userInfo.region === "" ? "text-[#9CA3AF]" : "text-[#2a4263]"
              }`}
            >
              <option value="" disabled>Select Region</option>
              {regions.map((reg: any) => (
                <option key={reg.reg_code} value={reg.reg_code} className="text-[#2a4263]">
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Province Selector */}
          <div className="form-control w-full mb-4">
            <label className="label font-semibold text-gray-700">Province</label>
            <select
              name="province"
              value={userInfo.province}
              onChange={handleChange}
              disabled={!userInfo.region} // Disable if no region selected
              className={`select select-bordered border-[#2a4263] w-full bg-white font-normal ${
                    userInfo.province === "" ? "text-[#9CA3AF]" : "text-[#2a4263]"
              }`}
            >
              <option value="" disabled>Select Province</option>
              {filteredProvinces.map((prov) => (
                <option key={prov.prov_code} value={prov.prov_code} className="text-[#2a4263]">
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Selector */}
          <div className="form-control w-full mb-4">
            <label className="label font-semibold text-gray-700">City / Municipality</label>
            <select
              name="city"
              value={userInfo.city}
              onChange={handleChange}
              disabled={!userInfo.province}
              className={`select select-bordered border-[#2a4263] w-full bg-white font-normal ${
                    userInfo.city === "" ? "text-[#9CA3AF]" : "text-[#2a4263]"
              }`}
            >
              <option value="" disabled>Select City</option>
              {filteredCities.map((city) => (
                <option key={city.mun_code} value={city.mun_code} className="text-[#2a4263]">
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Barangay Selector */}
          <div className="form-control w-full mb-4">
            <label className="label font-semibold text-gray-700">Barangay</label>
            <select
              name="barangay"
              value={userInfo.barangay}
              onChange={handleChange}
              disabled={!userInfo.city}
              className={`select select-bordered border-[#2a4263] w-full bg-white font-normal ${
                    userInfo.barangay === "" ? "text-[#9CA3AF]" : "text-[#2a4263]"
              }`}
            >
              <option value="" disabled>Select Barangay</option>
              {filteredBarangays.map((brgy) => (
                <option key={brgy.name} value={brgy.name} className="text-[#2a4263]">
                  {brgy.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-soft bg-blue rounded"
                  onClick={handleNext}>Next</button>
        </div>
      )}
      </div>
    </div>
  );
}