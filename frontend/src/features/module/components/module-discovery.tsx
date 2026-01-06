import React, { useState } from 'react';
import { LuChevronRight, LuStar, LuDumbbell, LuGlobe, LuSearch } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { MOCK_USER, MOCK_MODULES } from '../api/mock-data';
import { useUserData } from '../api/use-user-data';

import { paths } from '@/config/paths';

export default function ModuleDiscovery() {
  const [isOpenPractice, setIsOpenPractice] = useState(false);
  const [isOpenResources, setIsOpenResources] = useState(false);
 
  const { user, loading } = useUserData();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4">
      <div className="w-80 flex justify-start pl-4 mb-4"> 
        <button 
          onClick={() => navigate(paths.app.modules.search.getHref())}
          className="p-2.5 bg-white hover:bg-slate-50 transition-all text-btn-primary active:scale-95 cursor-pointer rounded-full shadow-lg flex items-center justify-center"
          aria-label="Search"
        >
          <LuSearch className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 bg-btn-primary text-white p-6 rounded-lg shadow-lg flex flex-col w-80 mb-8">
        <div className="flex flex-col leading-tight">
          {loading ? (
            <span className="text-2xl font-bold opacity-50">...</span>
          ) : (
            <span className="text-2xl font-bold">
              <LuStar className="inline-block mr-2" />
              
              {user?.points?.modules ?? MOCK_USER.points.modules}
            </span>
          )}
          <label className="text-[10px] uppercase tracking-wider">Points Earned</label>
        </div>
      </div>

        <div className="bg-btn-primary text-white p-6 rounded-lg shadow-lg flex flex-col w-80">
        <label className="text-sm font-medium opacity-80 uppercase tracking-wide">
            Learn
        </label>
        
        <h1 className="text-2xl font-medium mt-1">
            {MOCK_MODULES[0]?.title}
        </h1>
        
        <p className="text-xs mt-1 opacity-90">
            {MOCK_MODULES[0]?.desc}
        </p>

        <button className="mt-4 bg-white text-btn-primary font-semibold py-2 px-2 rounded hover:bg-gray-100 hover:text-btn-primary-hover transition-colors cursor-pointer w-full">
            Read
        </button>
        </div>

      {/* Practice Section */}
      <div
        onClick={() => setIsOpenPractice(!isOpenPractice)}
        className="mt-6 bg-bg-primary text-text-primary p-6 rounded-2xl shadow-lg flex flex-col w-80 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between">
          <LuDumbbell className="h-6 w-6 text-btn-primary" />
          <h1 className="text-xl font-semibold">Practice</h1>
          <LuChevronRight
            className={`h-6 w-6 transition-transform duration-300 ${
              isOpenPractice ? 'rotate-90' : 'rotate-0'
            }`}
          />
        </div>

        <label className="text-xs mt-1 cursor-pointer">
          Test yourself and earn points!
        </label>

        <div className={`transition-all duration-300 ease-in-out overflow-y-auto custom-scrollbar ${
          isOpenPractice ? 'max-h-60 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>

          <div className="border-t border-white/10 flex flex-col gap-2 pb-2">
            {MOCK_MODULES.map((m, i) => (
              <button key={i} className="mt-2 bg-btn-primary text-white text-left py-1 px-2 rounded hover:bg-btn-primary-hover transition-colors w-full">
                <div className="flex flex-col leading-tight">
                  <label className="text-xl font-medium cursor-pointer">{m.title}</label>
                  <p className="text-[10px] opacity-90 -mt-1">Quiz</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Resources Section */}
      <div
        onClick={() => setIsOpenResources(!isOpenResources)}
        className="mt-6 bg-bg-primary text-text-primary p-6 rounded-2xl shadow-lg flex flex-col w-80 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between">
          <LuGlobe className="h-6 w-6 text-btn-primary" />
          <h1 className="text-xl font-semibold">Resources</h1>
          <LuChevronRight
            className={`h-6 w-6 transition-transform duration-300 ${
              isOpenResources ? 'rotate-90' : 'rotate-0'
            }`}
          />
        </div>

        <label className="text-xs mt-1 cursor-pointer">
          Check out these sources from LGUs!
        </label>

        <div className={`transition-all duration-300 ease-in-out overflow-y-auto custom-scrollbar ${
          isOpenResources ? 'max-h-60 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>

          <div className="border-t border-white/10 flex flex-col gap-2 pb-2">
            {MOCK_MODULES.map((m, i) => (
              <button key={i} className="mt-2 bg-btn-primary text-white text-left py-1 px-2 rounded hover:bg-btn-primary-hover transition-colors w-full">
                <div className="flex flex-col leading-tight">
                  <label className="text-xl font-medium cursor-pointer">{m.title}</label>
                  <p className="text-[10px] opacity-90 -mt-1">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
