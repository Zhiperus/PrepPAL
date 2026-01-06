import React, { useState, type ChangeEvent, useEffect } from 'react';
import { LuSearch, LuArrowLeft } from 'react-icons/lu';
import { useSearchParams } from 'react-router';

import { useSearchFilter } from '../api/use-search-filter';

const TOP_SEARCHES: string[] = [
  'Fire',
  'Earthquake',
  'Evacuation',
  'Go-bag',
];

export function SearchModule(): React.JSX.Element {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { query, setQuery, filteredItems } = useSearchFilter(TOP_SEARCHES);

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) setQuery(urlQuery);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams(val ? { q: val } : {}, { replace: true });
  };

  const handleSelection = (item: string) => {
    setQuery(item);
    setSearchParams({ q: item }, { replace: true });
    setIsFocused(false);
  };

  return (
    <div className="bg-base-200/95 fixed top-15 z-30 w-full max-w-lg inset-x-0 mx-auto px-4 py-3 backdrop-blur-sm border-b border-base-300/50">
      <div className="flex w-full items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="btn btn-ghost btn-circle btn-sm hover:bg-base-300 text-text-primary shrink-0"
        >
          <LuArrowLeft className="h-6 w-6" />
        </button>

        <div className="relative flex-1">
          <label className="input input-bordered flex w-full items-center gap-3 shadow-sm transition-all bg-white focus-within:ring-1 focus-within:ring-btn-primary focus-within:border-btn-primary focus-within:outline-none border-base-300 p-2 border rounded-lg">
            <LuSearch className="h-4 w-4 opacity-50 text-slate-500" />
            <input
              type="search"
              className="grow text-sm bg-transparent outline-none text-slate-900 w-full"
              placeholder="Search modules..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </label>

          {isFocused && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              
              {!query && (
                <div className="px-4 py-3 border-b border-slate-50">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest block mb-2">
                    Top Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TOP_SEARCHES.map((tag) => (
                      <button
                        key={tag}
                        onMouseDown={() => handleSelection(tag)}
                        className="px-3 py-1 bg-slate-100 hover:bg-btn-primary hover:text-white text-slate-600 rounded-full text-xs transition-colors border border-slate-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-4 py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50/50">
                {query ? 'Search Results' : 'Suggested'}
              </div>
              
              <ul className="max-h-60 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <li
                      key={item}
                      className="px-4 py-3 hover:bg-slate-50 text-slate-700 cursor-pointer text-sm flex items-center gap-3 transition-colors"
                      onMouseDown={() => handleSelection(item)}
                    >
                      <LuSearch className="h-3 w-3 opacity-30" />
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-8 text-center text-slate-400 text-sm italic">
                    No results for &quot;{query}&quot;
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}