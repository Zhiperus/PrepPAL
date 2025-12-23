import PhilippinesData from "phil-reg-prov-mun-brgy";
import { useState } from 'react';
import { useNavigate } from 'react-router';

const { regions, provinces, city_mun, barangays } = PhilippinesData;

import module from '../../assets/light-bulb.png';
import leaderboard from '../../assets/podium.png';
import goBag from '../../assets/school-bag.png';

import { paths } from '@/config/paths';

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
      
      {/* Website Features */}
      <div className="flex w-1/3 flex-col items-center justify-center bg-gray-300 p-4">
        <div className="card bg-base-100 w-full max-w-sm shadow-2xl bg-secondary-container">
          <div className="carousel w-full scroll-smooth">
            
            <div id="slide1" className="carousel-item relative w-full flex flex-col">
              <figure className="px-10 pt-10 h-64 flex items-center justify-center ">
                <img 
                  src={goBag} 
                  alt="Track your Go Bag" 
                  className="rounded-xl object-contain h-48 w-full drop-shadow-lg" 
                />
              </figure>
              <div className="card-body items-center text-center p-6">
                <h2 className="card-title text-2xl font-bold text-[#2a4263] min-h-[3rem] flex items-center">
                  Track your Go Bag
                </h2>
                <p className="text-gray-500 text-sm min-h-[3rem]">
                  Track your go bag items and earn points as your inventory is completed.
                </p>
              </div>
            </div>

            <div id="slide2" className="carousel-item relative w-full flex flex-col">
              <figure className="px-10 pt-10 h-64 flex items-center justify-center">
                <img 
                  src={module} 
                  alt="Refresher Modules" 
                  className="rounded-xl object-contain h-48 w-full drop-shadow-lg" 
                />
              </figure>
              <div className="card-body items-center text-center p-6">
                <h2 className="card-title text-2xl font-bold text-[#2a4263] min-h-[3rem] flex items-center">
                  Refresher Modules
                </h2>
                <p className="text-gray-500 text-sm min-h-[3rem]">
                  Brush up on your knowledge about natural disasters and earn points.
                </p>
              </div>
            </div>

            <div id="slide3" className="carousel-item relative w-full flex flex-col">
              <figure className="px-10 pt-10 h-64 flex items-center justify-center">
                <img 
                  src={leaderboard} 
                  alt="Leaderboard" 
                  className="rounded-xl object-contain h-48 w-full drop-shadow-lg" 
                />
              </figure>
              <div className="card-body items-center text-center p-6">
                <h2 className="card-title text-2xl font-bold text-[#2a4263] min-h-[3rem] flex items-center">
                  Leaderboard
                </h2>
                <p className="text-gray-500 text-sm min-h-[3rem]">
                  Compete with other people in staying disaster prepared.
                </p>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center gap-2 py-4 mb-2">
              <a href="#slide1" className="h-1.5 w-4 bg-gray-300 rounded-full hover:bg-[#2a4263] hover:w-8 transition-all duration-300"></a>
              <a href="#slide2" className="h-1.5 w-4 bg-gray-300 rounded-full hover:bg-[#2a4263] hover:w-8 transition-all duration-300"></a>
              <a href="#slide3" className="h-1.5 w-4 bg-gray-300 rounded-full hover:bg-[#2a4263] hover:w-8 transition-all duration-300"></a>
            </div>
        </div>
      </div>

      {/* Form for User Information */}
      <form className="flex w-2/3 flex-col items-left justify-center bg-[#F3F4F6] p-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}>

        <div className='flex flex-col items-end'>
          <h1 className="text-5xl font-extrabold text-[#1f2937] ">
            Help us get to know you better.
          </h1>
          <p className="mt-2 text-xl text-gray-500">
            These information will be used to make your experience more personalized.
          </p>
        </div>

        {page === 1 && (
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-[#1f2937]">Location</h2>

          {/* Region Selector */}
          <fieldset className="fieldset form-control w-full mb-4 hover:scale-103 transition-transform duration-300">
            <legend className="fieldset-legend font-semibold text-base text-gray-700">Region</legend>
            <select
              name="region"
              value={userInfo.region}
              onChange={handleChange}
              required
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
          </fieldset>

          {/* Province Selector */}
          <fieldset className="fieldset form-control w-full mb-4 hover:scale-103 transition-transform duration-300">
            <legend className="fieldset-legend font-semibold text-base text-gray-700">Province</legend>
            <select
              name="province"
              value={userInfo.province}
              onChange={handleChange}
              disabled={!userInfo.region} // Disable if no region selected
              required
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
          </fieldset>

          {/* City Selector */}
          <fieldset className="fieldset form-control w-full mb-4 hover:scale-103 transition-transform duration-300">
            <legend className="fieldset-legend font-semibold text-base text-gray-700">City / Municipality</legend>
            <select
              name="city"
              value={userInfo.city}
              onChange={handleChange}
              disabled={!userInfo.province}
              required
              className={`select select-bordered border-[#2a4263] w-full bg-white font-normal ${
                    userInfo.city === "" ? "text-[#9CA3AF]" : "text-[#2a4263]"
              }`}
            >
              <option value="" disabled>Select City/Municipality</option>
              {filteredCities.map((city) => (
                <option key={city.mun_code} value={city.mun_code} className="text-[#2a4263]">
                  {city.name}
                </option>
              ))}
            </select>
          </fieldset>

          {/* Barangay Selector */}
          <fieldset className="fieldset form-control w-full mb-4 hover:scale-103 transition-transform duration-300">
            <legend className="fieldset-legend font-semibold text-base text-gray-700">Barangay</legend>
            <select
              name="barangay"
              value={userInfo.barangay}
              onChange={handleChange}
              disabled={!userInfo.city}
              required
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
          </fieldset>
          <button className="btn btn-soft btn-primary-custom rounded text-lg hover:scale-103 transition-transform duration-300"
                  onClick={handleNext}>Next</button>
        </div>
      )}
      {page === 2 && (
        <div>
          {/* Household Name */}
          <fieldset className="fieldset hover:scale-103 transition-transform duration-300">
            <legend className="fieldset-legend text-lg text-secondary-custom">Household Name</legend>
            <input type="text"
                    name="householdName"            
                    value={userInfo.householdName}  
                    onChange={handleChange}         
                    placeholder="Enter Household Name"
                    required
                    className="input validator bg-primary-container border-container-secondary w-full text-primary-custom placeholder:text-placeholder"/>
          <span className="validator-hint hidden">Required</span>
          </fieldset>

          {/* Number of Household Members */}
          <fieldset className="fieldset hover:scale-103 transition-transform duration-300">
            <legend className="fieldset-legend text-lg text-secondary-custom">Number of Household Members</legend>
            <input type="number"
                    name="memberCount"            
                    value={userInfo.memberCount}  
                    onChange={handleChange}         
                    placeholder="Enter Number"
                    required
                    className="input validator bg-primary-container border-container-secondary w-full text-primary-custom placeholder:text-placeholder"/>
            <span className="validator-hint hidden">Required</span>
          </fieldset>

          {/* Number of Female Members */}
          <fieldset className="fieldset hover:scale-103 transition-transform duration-300">
            <legend className="fieldset-legend text-lg text-secondary-custom">Number of Female Members (if any)</legend>
            <input type="number"
                    name="femaleCount"            
                    value={userInfo.femaleCount}  
                    onChange={handleChange}         
                    placeholder="Enter Number"
                    className="input validator bg-primary-container border-container-secondary w-full text-primary-custom placeholder:text-placeholder"/>
          </fieldset>

          {/* Number of Dogs */}
          <fieldset className="fieldset hover:scale-103 transition-transform duration-300">
            <legend className="fieldset-legend text-lg text-secondary-custom">Number of Dogs (if any)</legend>
            <input type="number"
                    name="dogCount"            
                    value={userInfo.dogCount}  
                    onChange={handleChange}         
                    placeholder="Enter Number"
                    className="input validator bg-primary-container border-container-secondary w-full text-primary-custom placeholder:text-placeholder"/>
          </fieldset>

          {/* Number of Cats */}
          <fieldset className="fieldset hover:scale-103 transition-transform duration-300">
            <legend className="fieldset-legend text-lg text-secondary-custom">Number of Cats (if any)</legend>
            <input type="number"
                    name="catCount"            
                    value={userInfo.catCount}  
                    onChange={handleChange}         
                    placeholder="Enter Number"
                    className="input validator bg-primary-container border-container-secondary w-full text-primary-custom placeholder:text-placeholder"/>
          </fieldset>

          <div className='flex flex-row gap-4 w-full pt-6'>
            <button className="btn btn-soft btn-secondary-custom rounded text-lg flex-1 hover:scale-103 transition-transform duration-300"
                    type="button"
                    onClick={handleBack}>Back
            </button>
            
            <button className="btn btn-soft btn-primary-custom rounded text-lg flex-1 hover:scale-103 transition-transform duration-300"
                    type='submit'>Done</button>
          </div>
          <span className="flex block justify-center mt-4 text-base text-secondary-custom italic">
            By clicking Done, you agree to receive timely reminders to update your go bag via email.
          </span>
        </div>
      )}
      </form>
    </div>
  ); 
}
